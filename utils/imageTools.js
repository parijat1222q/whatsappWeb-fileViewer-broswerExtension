class ImageTools {
    static view(blobUrl, modal) {
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; overflow: hidden;';

        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = 'flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; width: 100%; position: relative;';

        const img = document.createElement('img');
        img.src = blobUrl;
        img.style.cssText = 'max-width: 100%; max-height: 100%; transition: transform 0.2s;';

        let scale = 1;

        imgContainer.appendChild(img);
        container.appendChild(imgContainer);

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.padding = '10px';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '10px';

        const zoomIn = modal.createButton('Zoom In (+)', () => {
            scale += 0.2;
            img.style.transform = `scale(${scale})`;
        }, null);

        const zoomOut = modal.createButton('Zoom Out (-)', () => {
            scale = Math.max(0.2, scale - 0.2);
            img.style.transform = `scale(${scale})`;
        }, null);

        const reset = modal.createButton('Reset', () => {
            scale = 1;
            img.style.transform = `scale(1)`;
        }, null);

        toolbar.appendChild(zoomIn);
        toolbar.appendChild(zoomOut);
        toolbar.appendChild(reset);

        container.appendChild(toolbar);

        modal.setContent(container);
    }
}
