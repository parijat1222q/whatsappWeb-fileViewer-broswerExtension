const _NAME = 'WA-FileViewer';
const originalClick = HTMLAnchorElement.prototype.click;

let modalInstance = null;
function getModal() {
    if (!modalInstance) {
        modalInstance = new Modal();
    }
    return modalInstance;
}

class FileHandlerRegistry {
    constructor() {
        this.handlers = [];
    }

    register(handler) {
        this.handlers.push(handler);
    }

    process(anchor) {
        for (const handler of this.handlers) {
            const href = anchor.href || '';
            const download = anchor.download || '';
            if (handler.shouldHandle(download, href)) {
                if (handler.handle(anchor)) {
                    return true;
                }
            }
        }
        return false;
    }
}

const fileHandler = new FileHandlerRegistry();

// --- Handlers ---

// PDF
fileHandler.register({
    type: 'PDF',
    shouldHandle: (name, href) => (name && name.toLowerCase().endsWith('.pdf')) || href.toLowerCase().endsWith('.pdf'),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download || 'Document.pdf');
            m.showIframe(blobUrl);
            return true;
        }
        return false;
    }
});

// CSV
fileHandler.register({
    type: 'CSV',
    shouldHandle: (name, href) => (name && name.toLowerCase().endsWith('.csv')) || href.toLowerCase().endsWith('.csv'),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download);
            m.setLoading(true);
            fetch(blobUrl).then(r => r.text()).then(async csvText => {
                m.setLoading(false);
                const content = await CsvTools.processAndRender(csvText, m);
                m.setContent(content);
            }).catch(e => { m.setLoading(false); m.renderPermissionsWarning(e.message); });
            return true;
        }
        return false;
    }
});

// Excel
fileHandler.register({
    type: 'Excel',
    shouldHandle: (name, href) => /\.(xlsx|xls)$/i.test(name || href),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download);
            m.setLoading(true);
            fetch(blobUrl).then(r => r.blob()).then(async blob => {
                const csvText = await ExcelTools.convertToCsv(blob);
                m.setLoading(false);
                const content = await CsvTools.processAndRender(csvText, m);
                m.setContent(content);
            }).catch(e => { m.setLoading(false); m.renderPermissionsWarning(e.message); });
            return true;
        }
        return false;
    }
});

// JSON
fileHandler.register({
    type: 'JSON',
    shouldHandle: (name, href) => /\.(json)$/i.test(name || href),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download);
            // Simplified: Use Iframe for native JSON viewing
            m.showIframe(blobUrl);
            return true;
        }
        return false;
    }
});

// Code / Text
fileHandler.register({
    type: 'Code',
    shouldHandle: (name, href) => /\.(js|py|txt|html|css|md|xml)$/i.test(name || href),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download);
            m.setLoading(true);
            fetch(blobUrl).then(r => r.text()).then(text => {
                m.setLoading(false);
                const ext = (anchor.download || '').split('.').pop();
                TextTools.viewCode(text, ext, m);
            });
            return true;
        }
        return false;
    }
});

// Image
fileHandler.register({
    type: 'Image',
    shouldHandle: (name, href) => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name || href),
    handle: (anchor) => {
        const blobUrl = anchor.href;
        if (blobUrl) {
            const m = getModal();
            m.show(anchor.download);
            ImageTools.view(blobUrl, m);
            return true;
        }
        return false;
    }
});

HTMLAnchorElement.prototype.click = function () {
    if (fileHandler.process(this)) {
        return;
    }
    return originalClick.apply(this, arguments);
};
