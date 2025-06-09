class Printer {
    /**
     * Print a specific HTML element by selector
     * @param {string} selector - CSS selector string
     * @returns {Promise<boolean>} - Success status
     */
    static async PrintElementBySelector(selector) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`Element to print not found: ${selector}`);
                return false;
            }
            return await PrinterUtils.printElement(element);
        } catch (error) {
            console.error('Error printing element by selector:', error);
            return false;
        }
    }

    /**
     * Print a specific HTML element by element reference
     * @param {Object} element - ElementReference object
     * @returns {Promise<boolean>} - Success status
     */
    static async PrintElementByReference(element) {
        try {
            if (!element) {
                console.error('Invalid printing element reference.');
                return false;
            }

            return await PrinterUtils.printElement(element);
        } catch (error) {
            console.error('Error printing element by reference:', error);
            return false;
        }
    }

    /**
     * Print arbitrary HTML content
     * @param {string} htmlContent - HTML content to print
     * @returns {Promise<boolean>} - Success status
     */
    static async PrintElementContent(htmlContent) {
        try {
            if (!htmlContent) {
                console.error('Invalid HTML content to print.');
                return false;
            }

            // Create a temporary container for the HTML content
            const element = document.createElement('div');
            element.style.position = 'fixed';
            element.style.left = '-9999px';
            element.style.top = '0';
            element.style.width = '800px'; // Set width for consistent rendering
            element.style.backgroundColor = '#ffffff';
            element.innerHTML = htmlContent.replace(/\x3C!--!-->/g, ''); // Remove Blazor comment markers

            document.body.appendChild(element);

            try {
                const imgUrl = await PrinterUtils.createImgUrl(element);
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                return await PrinterUtils.printImage(imgUrl);
            } catch (error) {
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                console.error('Error converting HTML to image:', error);
                return false;
            }
        } catch (error) {
            console.error('Error preparing content for print:', error);
        }
    }

    /**
     * Add selection tool to the page
     * @param {Object} options - Configuration options
     * @param {string} options.highlightColor - Color for highlighting (default: 'rgba(255, 193, 7, 0.3)')
     * @param {string} options.highlightBorder - Border style for highlighting (default: '2px dashed #ffc107')
     * @returns {boolean} - Whether the tool was successfully added
     */
    static ActivateSelection(options = {}) {
        if (PrinterUtils.IsSelectionActive) {
            return false;
        }

        PrinterUtils.createHighlightOverlay(options);
        PrinterUtils.subscribeToSelectionEvents();

        PrinterUtils.IsSelectionActive = true;
        PrinterUtils.IsSelectionLocked = false;
        
        console.log(`Selection tool activated. IsSelectionActive: ${PrinterUtils.IsSelectionActive}, IsSelectionLocked: ${PrinterUtils.IsSelectionLocked}`);

        return true;
    }

    /**
     * Remove selection tool from the page
     * @returns {boolean} - Whether the tool was successfully removed
     */
    static DeactivateSelection() {
        if (!PrinterUtils.IsSelectionActive) {
            return false;
        }

        PrinterUtils.unsubscribeFromSelectionEvents();
        PrinterUtils.removeHighlightOverlay();
        PrinterUtils.unlockSelection();
        
        console.log(`Selection tool deactivated. IsSelectionActive: ${PrinterUtils.IsSelectionActive}, IsSelectionLocked: ${PrinterUtils.IsSelectionLocked}`);

        return true;
    }

    /**
     * Print the currently selected element as an image
     * @returns {Promise<boolean>} - Success status
     */
    static
    async PrintSelectedElement() {
        if (!PrinterUtils.SelectedElement) {
            console.error('No element selected for printing.');
            return false;
        }

        console.log(`Printing selected element: ${PrinterUtils.SelectedElement.tagName}`);
        return await PrinterUtils.printElement(PrinterUtils.SelectedElement);
    }
}

class PrinterUtils {
    static IsSelectionActive = false;
    static IsSelectionLocked = false;
    static SelectedElement = null;
    static HighlightOverlay = null;

    static loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load html2canvas'));
                document.head.appendChild(script);
            }
        });
    }

    /**
     * Capture an element as an image
     * @param {HTMLElement} element - The element to capture
     * @returns {Promise<string>} - Data URL of the captured image
     */
    static async createImgUrl(element) {
        if (!element) {
            throw new Error('Element to capture is undefined');
        }

        if (element instanceof HTMLCanvasElement) {
            try {
                return element.toDataURL('image/png');
            } catch (e) {
                console.error('Error capturing canvas:', e);
                throw e;
            }
        }

        try {
            const canvas = await html2canvas(element, {
                allowTaint: true,
                useCORS: true,
                scale: 2, // Higher scale for better quality
                logging: false,
                backgroundColor: '#ffffff'
            });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('Error capturing element with html2canvas:', e);
            throw e;
        }
    }

    /**
     * Print an image from a data URL
     * @param {string} imgUrl - The image data URL
     * @returns {Promise<boolean>} - Success status
     */
    static async printImage(imgUrl) {
        try {
            const iframe = document.createElement('iframe');

            iframe.style.position = 'fixed';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.opacity = '0';
            iframe.style.border = 'none';

            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;

            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <title>Print</title>
                        <style>
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 0;
                                }
                                img {
                                    max-width: 100%;
                                    display: block;
                                    margin: 0 auto;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imgUrl}" alt="Print content" />
                    </body>
                </html>`);
            doc.close();

            return new Promise((resolve) => {
                iframe.contentWindow.addEventListener('afterprint', () => {
                    document.body.removeChild(iframe);
                    resolve(true);
                }, {once: true});

                // Fallback if afterprint doesn't fire
                const timeoutId = setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                        resolve(true);
                    }
                }, 5000);

                iframe.onload = () => {
                    try {
                        setTimeout(() => {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        }, 500);
                    } catch (e) {
                        clearTimeout(timeoutId);
                        document.body.removeChild(iframe);
                        console.error('Error during print operation:', e);
                        resolve(false);
                    }
                };
            });
        } catch (error) {
            console.error('Error preparing image for print:', error);
            return false;
        }
    }

    /**
     * Print an element as an image
     * @param {HTMLElement} element - The element to print
     * @returns {Promise<boolean>} - Success status
     */
    static async printElement(element) {
        try {
            if (!element) {
                console.error('Invalid element to print.');
                return false;
            }

            const imgUrl = await this.createImgUrl(element);
            return await this.printImage(imgUrl);
        } catch (error) {
            console.error('Error printing element as image:', error);
            return false;
        }
    }

    /**
     * Lock the current selection, allowing interaction with other elements
     * @returns {boolean} - Whether the selection was successfully locked
     */
    static lockSelection(element) {
        if (!this.IsSelectionActive || this.IsSelectionLocked) {
            return false;
        }

        this.SelectedElement = element;
        this.IsSelectionLocked = true;
        return true;
    }

    /**
     * Unlock the current selection, allowing selection of new elements
     * @returns {void}
     */
    static unlockSelection() {
        this.IsSelectionLocked = false;
        this.IsSelectionActive = false;
        this.SelectedElement = null;
        this.HighlightOverlay = null;
    }

    static createHighlightOverlay(config) {

        if (!config.highlightColor)
            config.highlightColor = 'rgba(255, 193, 7, 0.3)';
        if (!config.highlightBorder)
            config.highlightBorder = '2px dashed #ffc107';
        
        this.HighlightOverlay = document.createElement('div');
        this.HighlightOverlay.style.position = 'absolute';
        this.HighlightOverlay.style.pointerEvents = 'none';
        this.HighlightOverlay.style.backgroundColor = config.highlightColor;
        this.HighlightOverlay.style.border = config.highlightBorder;
        this.HighlightOverlay.style.zIndex = '10000';
        this.HighlightOverlay.style.display = 'none';
        document.body.appendChild(this.HighlightOverlay)
        console.log(`Highlight overlay created with color: ${config.highlightColor} and border: ${config.highlightBorder}`);
    }

    static showHighlightOverlay(element) {
        const rect = element.getBoundingClientRect();
        this.HighlightOverlay.style.display = 'block';
        this.HighlightOverlay.style.top = `${window.scrollY + rect.top}px`;
        this.HighlightOverlay.style.left = `${window.scrollX + rect.left}px`;
        this.HighlightOverlay.style.width = `${rect.width}px`;
        this.HighlightOverlay.style.height = `${rect.height}px`;
        console.log(`Highlight overlay shown for element: ${element.tagName} at (${rect.left}, ${rect.top}) with size (${rect.width}x${rect.height})`);
    }

    static hideHighlightOverlay() {
        this.HighlightOverlay.style.display = 'none';
    }

    static removeHighlightOverlay() {
        if (this.HighlightOverlay && this.HighlightOverlay.parentNode) {
            this.HighlightOverlay.parentNode.removeChild(this.HighlightOverlay);
            this.HighlightOverlay = null;
        }
    }

    static subscribeToSelectionEvents() {
        if (!this.IsSelectionActive) {
            return;
        }

        document.addEventListener('mouseover', (event) => {
            if (this.IsSelectionLocked || event.target === document.body || event.target === document.documentElement) {
                return;
            }
            this.showHighlightOverlay(event.target);
            console.log(`Highlight overlay shown for element: ${event.target.tagName} at (${event.clientX}, ${event.clientY})`);
        }, true);

        document.addEventListener('mouseout', () => {
            if (this.IsSelectionLocked) {
                return;
            }
            this.hideHighlightOverlay();
            console.log('Highlight overlay hidden');
        }, true);

        document.addEventListener('click', (event) => {
            if (this.IsSelectionLocked || event.target === document.body || event.target === document.documentElement) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            this.lockSelection(event.target);
            this.showHighlightOverlay(this.SelectedElement);
            console.log(`Selection locked for element: ${this.SelectedElement.tagName} at (${event.clientX}, ${event.clientY})`);
            
            return false;
        }, true);
    }

    static unsubscribeFromSelectionEvents() {
        if (!this.IsSelectionActive) {
            return;
        }

        document.removeEventListener('mouseover', this.showHighlightOverlay, true);
        document.removeEventListener('mouseout', this.hideHighlightOverlay, true);
        document.removeEventListener('click', this.lockSelection, true);

        this.hideHighlightOverlay();
    }
}

window.GizmoWebJSInterop = window.GizmoWebJSInterop || {};
(async function () {
    try {
        await PrinterUtils.loadHtml2Canvas();
        console.log('html2canvas loaded successfully');
    } catch (error) {
        console.error('Failed to preload html2canvas. Printing functionality will not work. ', error);
    } finally {
        window.GizmoWebJSInterop.Printer = Printer;
        console.log('GizmoWebJSInterop.Printer initialized');
    }
})();