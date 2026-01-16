class ChartTools {
    static render(data, selection, container) {
        // Only render UI if selection is NOT provided (initial call)
        if (!selection) {
            this.renderSelectionUI(data, container);
            return;
        }

        // Render Chart
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        canvas.style.maxWidth = '100%';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const [labelIdx, valueIdx] = selection;

        // Extract data
        const labels = [];
        const values = [];

        data.forEach(row => {
            const labelVal = row[labelIdx];
            const valueVal = parseFloat(row[valueIdx]);

            if (labelVal !== undefined && !isNaN(valueVal)) {
                labels.push(labelVal);
                values.push(valueVal);
            }
        });

        if (values.length === 0) {
            container.textContent = 'No numeric data found for selected columns.';
            return;
        }

        // Basic Bar Chart Logic
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const maxVal = Math.max(...values, 1);
        const barWidth = chartWidth / values.length;

        ctx.fillStyle = '#000'; // Axis lines
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        values.forEach((val, i) => {
            const barHeight = (val / maxVal) * chartHeight;
            const x = padding + i * barWidth + (barWidth * 0.1);
            const y = canvas.height - padding - barHeight;
            const w = barWidth * 0.8;

            ctx.fillStyle = '#00a884'; // WhatsApp Green
            ctx.fillRect(x, y, w, barHeight);

            // Label
            ctx.fillStyle = '#555';
            ctx.font = '10px Arial';
            ctx.fillText(String(labels[i]).substring(0, 5) + '..', x, canvas.height - padding + 15);
        });

        // Back Button
        const backBtn = document.createElement('button');
        backBtn.textContent = 'Change Columns';
        backBtn.style.marginTop = '10px';
        backBtn.onclick = () => this.renderSelectionUI(data, container);
        container.appendChild(backBtn);
    }

    static renderSelectionUI(data, container) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.padding = '20px';

        const title = document.createElement('h3');
        title.textContent = 'Select Chart Axes';
        wrapper.appendChild(title);

        // Assume first row logic from CsvViewer (data passed here is raw rows)
        // Wait, CsvViewer passes displayedData. 
        // If we want headers we need CsvViewer to pass headers or we guess.
        // Actually CsvViewer should pass headers or we just use indices.
        // Let's assume indices are enough, or we need headers.
        // Quick fix: CsvViewer calls this with headers? No.
        // Let's just use "Column 1", "Column 2" etc if no headers available, 
        // but CsvViewer has headers.

        // Refactoring render signature to accept headers? 
        // Or assume data[0] is header if we passed raw?
        // CsvViewer passes `this.displayedData`. If headers are separate, we miss them.

        // Let's make UI generic: "Column Index".
        const headers = data[0] && isNaN(parseFloat(data[0][0])) ? data[0] : null;
        const colsCount = data[0] ? data[0].length : 0;

        const createSelect = (label) => {
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            const span = document.createElement('span');
            span.textContent = label + ': ';
            const select = document.createElement('select');

            for (let i = 0; i < colsCount; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = headers ? headers[i] : `Column ${i + 1}`;
                select.appendChild(opt);
            }
            div.appendChild(span);
            div.appendChild(select);
            return { div, select };
        };

        const xSel = createSelect('X Axis (Label)');
        const ySel = createSelect('Y Axis (Value)');

        // Auto-select likely value (last col?)
        ySel.select.selectedIndex = colsCount > 1 ? 1 : 0;

        wrapper.appendChild(xSel.div);
        wrapper.appendChild(ySel.div);

        const btn = document.createElement('button');
        btn.textContent = 'Generate Chart';
        btn.style.padding = '8px 16px';
        btn.style.marginTop = '10px';
        btn.onclick = () => {
            this.render(data, [xSel.select.value, ySel.select.value], container);
        };
        wrapper.appendChild(btn);

        container.appendChild(wrapper);
    }
}
