class Modal {
    constructor() {
        this.overlay = null;
        this.contentContainer = null;
        this.headerTitle = null;
        this.loadingSpinner = null;
        this.init();
    }

    init() {
        // Create the overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'wa-fileviewer-modal';
        this.overlay.style.display = 'none'; // Hidden by default

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = this.getStyles();
        document.head.appendChild(style);

        // Modal Structure
        this.overlay.innerHTML = `
            <div class="wa-fv-modal-content">
                <div class="wa-fv-modal-header">
                    <h2 id="wa-fv-modal-title">File Viewer</h2>
                    <div class="wa-fv-header-controls">
                        <!-- Custom controls can be injected here -->
                    </div>
                    <button id="wa-fv-close-btn">&times;</button>
                </div>
                <div class="wa-fv-modal-body">
                    <div id="wa-fv-loading" style="display: none;">
                        <div class="wa-fv-spinner"></div>
                        <span>Loading...</span>
                    </div>
                    <div id="wa-fv-content-area"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Element References
        this.contentContainer = this.overlay.querySelector('#wa-fv-content-area');
        this.headerTitle = this.overlay.querySelector('#wa-fv-modal-title');
        this.loadingSpinner = this.overlay.querySelector('#wa-fv-loading');
        this.headerControls = this.overlay.querySelector('.wa-fv-header-controls');

        // Event Listeners
        this.overlay.querySelector('#wa-fv-close-btn').addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
    }

    getStyles() {
        return `
            #wa-fileviewer-modal {
                position:fixed;
                top:0;
                left:0;
                width:100%;
                height:100%;
                background-color:rgba(0,0,0,0.7);
                z-index:999999;
                display:flex;
                justify-content:center;
                align-items:center;
                backdrop-filter:blur(2px);
            }

            .wa-fv-modal-content {
                background-color:#ffffff;
                width:90%;
                height:90%;
                max-width:1200px;
                border-radius:8px;
                display:flex;
                flex-direction:column;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                color:#3b4a54;
                font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
            }

            /* Dark Mode Support */
            body.dark .wa-fv-modal-content, body.web.dark .wa-fv-modal-content {
                background-color:#111b21;
                color:#e9edef;
            }

            .wa-fv-modal-header {
                padding:16px 24px;
                background-color:#f0f2f5;
                border-bottom:1px solid #e9edef;
                border-radius:8px 8px 0 0;
                display:flex;
                align-items:center;
                justify-content:space-between;
                flex-shrink:0;
            }

            body.dark .wa-fv-modal-header, body.web.dark .wa-fv-modal-header {
                background-color:#202c33;
                border-bottom:1px solid #2a3942;
            }

            #wa-fv-modal-title {
                margin:0;
                font-size:1.2rem;
                font-weight:500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space:nowrap;
                flex:1;
            }

            .wa-fv-header-controls {
                margin:0 15px;
                display:flex;
                gap:10px;
            }

             /* Filter Input Styles */
            .wa-fv-filter-input {
                padding:6px 10px;
                border-radius:4px;
                border:1px solid #ccc;
                font-size:14px;
                outline:none;
            }
            body.dark .wa-fv-filter-input, body.web.dark .wa-fv-filter-input {
                background-color:#2a3942;
                border-color:#8696a0;
                color: #e9edef;
            }

            #wa-fv-close-btn {
                background: none;
                border: none;
                font-size:24px;
                cursor:pointer;
                color:#54656f;
                padding:0 8px;
                line-height:1;
            }

            body.dark #wa-fv-close-btn, body.web.dark #wa-fv-close-btn {
                color:#aebac1;
            }

            .wa-fv-modal-body {
                flex:1;
                overflow:hidden;
                position:relative;
                display:flex;
                flex-direction:column;
            }

            #wa-fv-content-area {
                flex:1;
                overflow:auto;
                padding:20px;
            }

            /* Loading Spinner */
            #wa-fv-loading {
                position:absolute;
                top:0;
                left:0;
                width:100%;
                height:100%;
                background:rgba(255,255,255,0.8);
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items: center;
                z-index: 10;
            }
            body.dark #wa-fv-loading, body.web.dark #wa-fv-loading {
                background: rgba(17, 27, 33, 0.8);
            }

            .wa-fv-spinner {
                border:4px solid #f3f3f3;
                border-top:4px solid #00a884;
                border-radius:50%;
                width:40px;
                height:40px;
                animation:spin 1s linear infinite;
                margin-bottom:10px;
            }
            body.dark .wa-fv-spinner, body.web.dark .wa-fv-spinner {
                border-color:#2a3942;
                border-top-color:#00a884;
            }

            @keyframes spin {
                0% { transform:rotate(0deg); }
                100% { transform:rotate(360deg); }
            }
        `;
    }

    show(title = 'File Viewer') {
        this.headerTitle.textContent = title;
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.overlay.style.display = 'none';
        document.body.style.overflow = '';
        this.contentContainer.innerHTML = '';
        this.headerControls.innerHTML = '';
    }

    setLoading(isLoading) {
        this.loadingSpinner.style.display = isLoading ? 'flex' : 'none';
    }

    setContent(contentElement) {
        this.contentContainer.innerHTML = '';
        if (contentElement) {
            this.contentContainer.appendChild(contentElement);
        }
    }

    addHeaderControl(element) {
        this.headerControls.appendChild(element);
    }

    showIframe(blobUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = blobUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        this.setContent(iframe);
    }

    createButton(text, onClick, icon = null) {
        const btn = document.createElement('button');
        btn.textContent = text;
        if (icon) {
            // Logic to prepend icon if needed
        }
        btn.style.cssText = `
            margin-right: 10px;
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: rgba(255,255,255,0.8);
            cursor: pointer;
            font-size: 14px;
        `;
        // Dark mode styles could be applied via class
        btn.className = 'wa-fv-header-btn';

        btn.addEventListener('click', onClick);
        return btn;
    }

    renderPermissionsWarning(msg) {
        const div = document.createElement('div');
        div.style.padding = '20px';
        div.style.color = 'red';
        div.textContent = msg;
        this.setContent(div);
    }
}
