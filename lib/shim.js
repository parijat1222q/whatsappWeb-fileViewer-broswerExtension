/**
 * Shim to force libraries (like SheetJS) to use the global 'window' scope 
 * instead of trying to register as an AMD or CommonJS module.
 * This prevents conflicts with WhatsApp Web's module loader.
 */
(function () {
    console.log('[WA-FileViewer] Shim loaded: hiding module loaders.');
    // Backup existing loaders if needed (though we likely won't restore them to avoid breaking the lib)
    window.wa_fv_backup = {
        define: window.define,
        module: window.module,
        exports: window.exports
    };

    // Temporarily undefine them so libraries fall back to 'window' assignment
    window.define = undefined;
    window.module = undefined;
    window.exports = undefined;
})();
