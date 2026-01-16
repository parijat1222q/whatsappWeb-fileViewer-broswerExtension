class CsvParser {
    static parse(csvText) {
        if (typeof csvText !== 'string') {
            throw new Error('Invalid input: csvText must be a string.');
        }

        const data = [];
        let maxCols = 0;
        let row = [];
        const regex = /("((?:""|[^"])*)"|([^,\r\n]*))(,|\r\n?|\n|$)/g;
        let match;

        while ((match = regex.exec(csvText)) !== null) {
            if (match[0].length === 0) break;

            const cell = match[2] !== undefined ? match[2].replace(/""/g, '"') : match[3];
            row.push(cell);

            const delimiter = match[4];
            if (delimiter === '\r' || delimiter === '\n' || delimiter === '\r\n') {
                if (row.length > maxCols) maxCols = row.length;
                data.push(row);
                row = [];
            }
        }

        if (row.length > 0) {
            if (row.length > maxCols) maxCols = row.length;
            data.push(row);
        }

        return { data, maxCols };
    }
}

class CsvViewer {
    constructor(data, maxCols) {
        this.originalData = data;
        this.displayedData = [...data];
        this.maxCols = maxCols;
        this.headers = null;
        this.sortConfig = { colIndex: -1, direction: 'asc' }; // 'asc' or 'desc'
        this.visibleColumns = new Set();

        // Assume first row is header if present, else generate generic headers
        if (this.originalData.length > 0) {
            this.headers = this.originalData[0];
            this.displayedData = this.originalData.slice(1);
            this.originalRows = this.originalData.slice(1);
        } else {
            this.headers = [];
            this.originalRows = [];
        }

        // Initialize all columns as visible
        for (let i = 0; i < this.maxCols; i++) this.visibleColumns.add(i);
    }

    static create(data, maxCols) {
        return new CsvViewer(data, maxCols);
    }

    getStyles() {
        return `
            .wa-fv-table-container {
                overflow: auto;
                max-height: 100%;
            }
            .wa-fv-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: auto;
            }
            .wa-fv-table th, .wa-fv-table td {
                padding: 10px;
                border: 1px solid #ddd; 
                text-align: left;
                white-space: nowrap;
            }
            .wa-fv-table thead th {
                position: sticky;
                top: 0;
                background-color: #f2f2f2;
                z-index: 1;
                cursor: pointer;
                user-select: none;
            }
            .wa-fv-table thead th:hover {
                background-color: #e0e0e0;
            }
            .wa-fv-table tbody tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            /* Frozen Footer for Stats */
             .wa-fv-table tfoot th {
                position: sticky;
                bottom: 0;
                background-color: #e0f2f1;
                z-index: 1;
                font-weight: bold;
                border-top: 2px solid #00a884;
            }

            /* Dark Mode */
            body.dark .wa-fv-table th, body.dark .wa-fv-table td,
            body.web.dark .wa-fv-table th, body.web.dark .wa-fv-table td {
                border-color: #2a3942;
                color: #e9edef;
            }
            body.dark .wa-fv-table thead th, body.web.dark .wa-fv-table thead th {
                background-color: #202c33;
                color: #e9edef;
            }
             body.dark .wa-fv-table tfoot th, body.web.dark .wa-fv-table tfoot th {
                background-color: #111b21;
                color: #e9edef;
                border-top: 2px solid #00a884;
            }
            body.dark .wa-fv-table thead th:hover, body.web.dark .wa-fv-table thead th:hover {
                background-color: #2a3942;
            }
            body.dark .wa-fv-table tbody tr:nth-child(even), body.web.dark .wa-fv-table tbody tr:nth-child(even) {
                background-color: transparent; 
            }
             /* Sort Indicators */
            .wa-fv-sort-arrow {
                margin-left: 5px;
                font-size: 0.8em;
            }
            /* Column Toggle Menu */
            .wa-fv-col-menu {
                position: absolute;
                background: white;
                border: 1px solid #ccc;
                padding: 10px;
                display: none;
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
            }
            body.dark .wa-fv-col-menu, body.web.dark .wa-fv-col-menu {
                background: #202c33;
                border-color: #2a3942;
            }
        `;
    }

    render(modalInstance) {
        const container = document.createElement('div');
        container.className = 'wa-fv-table-container';

        if (!document.getElementById('wa-fv-table-styles')) {
            const style = document.createElement('style');
            style.id = 'wa-fv-table-styles';
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }

        this.table = document.createElement('table');
        this.table.className = 'wa-fv-table';

        container.appendChild(this.table);

        this.renderTableContent();

        // Add filter input
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter rows...';
        filterInput.className = 'wa-fv-filter-input';
        filterInput.addEventListener('input', (e) => this.handleFilter(e.target.value));

        if (modalInstance) {
            modalInstance.addHeaderControl(filterInput);

            // Columns Toggle
            const colBtn = modalInstance.createButton('Columns', (e) => this.showColumnMenu(e));
            modalInstance.addHeaderControl(colBtn);

            // Visualize
            const chartBtn = modalInstance.createButton('Visualize', () => this.showChart(modalInstance));
            modalInstance.addHeaderControl(chartBtn);

            // Export View
            const exportBtn = modalInstance.createButton('Export View', () => this.exportFilteredData(modalInstance));
            modalInstance.addHeaderControl(exportBtn);
        }

        return container;
    }

    exportFilteredData(modal) {
        // Reconstruct CSV from displayedData
        const headerRow = this.headers;
        const rows = [headerRow, ...this.displayedData];

        const csvContent = rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "exported_view.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    renderTableContent() {
        this.table.innerHTML = '';
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        const safeHeaders = [...this.headers];
        while (safeHeaders.length < this.maxCols) safeHeaders.push('');

        safeHeaders.forEach((headerText, index) => {
            if (!this.visibleColumns.has(index)) return; // Skip hidden columns

            const th = document.createElement('th');
            th.textContent = headerText;

            if (this.sortConfig.colIndex === index) {
                const arrow = this.sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
                const span = document.createElement('span');
                span.className = 'wa-fv-sort-arrow';
                span.textContent = arrow;
                th.appendChild(span);
            }

            th.addEventListener('click', () => this.handleSort(index));
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        this.table.appendChild(thead);

        const tbody = document.createElement('tbody');
        this.displayedData.forEach(row => {
            const tr = document.createElement('tr');
            const safeRow = [...row];
            while (safeRow.length < this.maxCols) safeRow.push('');

            safeRow.forEach((cellText, index) => {
                if (!this.visibleColumns.has(index)) return; // Skip hidden columns
                const td = document.createElement('td');
                td.textContent = cellText;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        this.table.appendChild(tbody);

        // Render Footer (Stats)
        this.renderFooter();
    }

    renderFooter() {
        const tfoot = document.createElement('tfoot');
        const tr = document.createElement('tr');

        const safeHeaders = [...this.headers];
        while (safeHeaders.length < this.maxCols) safeHeaders.push('');

        safeHeaders.forEach((_, index) => {
            if (!this.visibleColumns.has(index)) return;

            const th = document.createElement('th');
            // Check if column is numeric
            const values = this.displayedData.map(r => parseFloat(r[index])).filter(v => !isNaN(v));
            if (values.length > 0) {
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                th.innerHTML = `Sum: ${sum.toFixed(1)}<br>Avg: ${avg.toFixed(1)}`;
                th.style.fontSize = '0.8em';
            }
            tr.appendChild(th);
        });
        tfoot.appendChild(tr);
        this.table.appendChild(tfoot);
    }

    handleSort(colIndex) {
        if (this.sortConfig.colIndex === colIndex) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.colIndex = colIndex;
            this.sortConfig.direction = 'asc';
        }

        this.displayedData.sort((a, b) => {
            const valA = a[colIndex] || '';
            const valB = b[colIndex] || '';

            // Try numeric sort
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            if (!isNaN(numA) && !isNaN(numB)) {
                return this.sortConfig.direction === 'asc' ? numA - numB : numB - numA;
            }

            if (valA < valB) return this.sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderTableContent();
    }

    handleFilter(query) {
        if (!query) {
            this.displayedData = [...this.originalRows];
        } else {
            const lowerQuery = query.toLowerCase();
            this.displayedData = this.originalRows.filter(row =>
                row.some(cell => String(cell).toLowerCase().includes(lowerQuery))
            );
        }
        if (this.sortConfig.colIndex !== -1) {
            this.handleSort(this.sortConfig.colIndex);
        } else {
            this.renderTableContent();
        }
    }

    showColumnMenu(event) {
        let menu = document.getElementById('wa-fv-col-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'wa-fv-col-menu';
            menu.className = 'wa-fv-col-menu';
            document.body.appendChild(menu);

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (e.target !== event.target && !menu.contains(e.target)) {
                    menu.style.display = 'none';
                }
            });
        }

        menu.innerHTML = '';
        this.headers.forEach((h, i) => {
            if (i >= this.maxCols) return;
            const div = document.createElement('div');
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = this.visibleColumns.has(i);
            chk.onchange = () => {
                if (chk.checked) this.visibleColumns.add(i);
                else this.visibleColumns.delete(i);
                this.renderTableContent();
            };
            const span = document.createElement('span');
            span.textContent = h || `Col ${i + 1}`;
            span.style.marginLeft = '5px';

            div.appendChild(chk);
            div.appendChild(span);
            menu.appendChild(div);
        });

        const rect = event.target.getBoundingClientRect();
        menu.style.display = 'block';
        menu.style.top = (rect.bottom + 5) + 'px';
        menu.style.left = rect.left + 'px';
    }

    showChart(modal) {
        const container = document.createElement('div');
        // Pick first 2 visible columns
        const visibleCols = [...this.visibleColumns].sort((a, b) => a - b);
        if (visibleCols.length < 2) {
            alert('Need at least 2 visible columns for chart');
            return;
        }

        ChartTools.render(this.displayedData, [visibleCols[0], visibleCols[1]], container);
        modal.setContent(container);
    }
}

class CsvTools {
    static async processAndRender(csvText, modalInstance) {
        const { data, maxCols } = CsvParser.parse(csvText);
        const viewer = CsvViewer.create(data, maxCols);
        const content = viewer.render(modalInstance);
        return content;
    }
}