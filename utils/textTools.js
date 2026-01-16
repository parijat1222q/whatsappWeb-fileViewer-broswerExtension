class TextTools {
    static viewJson(jsonText, modal) {
        let content;
        try {
            const obj = JSON.parse(jsonText);
            const formatted = JSON.stringify(obj, null, 2);
            content = this.createPre(formatted, 'json');
        } catch (e) {
            content = document.createElement('div');
            content.textContent = 'Invalid JSON: ' + e.message;
            content.style.color = 'red';
        }
        modal.setContent(content);
    }

    static viewCode(text, lang, modal) {
        const content = this.createPre(text, lang);
        modal.setContent(content);
    }

    static createPre(text, lang) {
        const container = document.createElement('div');
        container.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; max-height: 100%;';

        if (document.body.classList.contains('dark')) {
            container.style.background = '#202c33';
            container.style.color = '#e9edef';
        }

        const pre = document.createElement('pre');
        pre.style.margin = '0';
        pre.style.fontFamily = 'Consolas, monospace';

        // Basic Line Numbers
        const code = document.createElement('code');
        code.textContent = text;

        pre.appendChild(code);
        container.appendChild(pre);
        return container;
    }
}
