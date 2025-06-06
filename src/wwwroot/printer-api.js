class Printer {
    /**
     * Print a specific HTML element by selector
     * @param {string} selector - CSS selector string
     * @returns {Promise<boolean>} - Success status
     */
    static async printElementBySelector(selector) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`Element to print not found: ${selector}`);
                return false;
            }
            return await this.printElementContent(element.outerHTML);
        } catch (error) {
            console.error('Error printing element by selector:', error);
            return false;
        }
    }

    /**
     * Print a specific HTML element by element reference
     * @param {Object} elementRef - ElementReference object
     * @returns {Promise<boolean>} - Success status
     */
    static async printElementByReference(elementRef) {
        try {
            if (!elementRef) {
                console.error('Invalid printing element reference.');
                return false;
            }
            return await this.printElementContent(elementRef.outerHTML);
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
    static async printElementContent(htmlContent) {
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
                                html, body { margin: 0; padding: 0; }
                                @page { margin: 0.5cm; }
                                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>${htmlContent}</body>
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
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();

                        // If print is canceled and afterprint doesn't fire
                        // The fallback timeout will handle cleanup
                    } catch (e) {
                        clearTimeout(timeoutId);
                        document.body.removeChild(iframe);
                        console.error('Error during print operation:', e);
                        resolve(false);
                    }
                };
            });
        } catch (error) {
            console.error('Error preparing content for print:', error);
            return false;
        }
    }

    // Element selection variables
    static isSelectionActive = false;
    static isSelectionLocked = false;
    static selectedElement = null;
    static highlightOverlay = null;
    static selectionEventListeners = [];

    /**
     * Add selection tool to the page
     * @param {Object} options - Configuration options
     * @param {string} options.highlightColor - Color for highlighting (default: 'rgba(74, 144, 226, 0.3)')
     * @param {string} options.highlightBorder - Border style for highlighting (default: '2px dashed #4a90e2')
     * @returns {boolean} - Whether the tool was successfully added
     */
    static activateSelection(options = {}) {
        if (this.isSelectionActive) {
            return false;
        }

        const defaultOptions = {
            highlightColor: 'rgba(74, 144, 226, 0.3)',
            highlightBorder: '2px dashed #4a90e2'
        };

        const config = {...defaultOptions, ...options};

        // Create a highlight overlay
        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.style.position = 'absolute';
        this.highlightOverlay.style.pointerEvents = 'none';
        this.highlightOverlay.style.backgroundColor = config.highlightColor;
        this.highlightOverlay.style.border = config.highlightBorder;
        this.highlightOverlay.style.zIndex = '10000';
        this.highlightOverlay.style.display = 'none';
        document.body.appendChild(this.highlightOverlay);

        // Event handlers
        const handleMouseOver = (event) => {
            if (this.isSelectionLocked || event.target === document.body || event.target === document.documentElement) {
                return;
            }

            const rect = event.target.getBoundingClientRect();
            this.highlightOverlay.style.display = 'block';
            this.highlightOverlay.style.top = `${window.scrollY + rect.top}px`;
            this.highlightOverlay.style.left = `${window.scrollX + rect.left}px`;
            this.highlightOverlay.style.width = `${rect.width}px`;
            this.highlightOverlay.style.height = `${rect.height}px`;
        };

        const handleMouseOut = () => {
            if (this.isSelectionLocked) {
                return;
            }
            this.highlightOverlay.style.display = 'none';
        };

        const handleClick = (event) => {
            if (this.isSelectionLocked || event.target === document.body || event.target === document.documentElement) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.selectedElement = event.target;

            // Lock the selection
            this.lockSelection();

            // Show the highlight overlay permanently for the selected element
            const rect = this.selectedElement.getBoundingClientRect();
            this.highlightOverlay.style.display = 'block';
            this.highlightOverlay.style.top = `${window.scrollY + rect.top}px`;
            this.highlightOverlay.style.left = `${window.scrollX + rect.left}px`;
            this.highlightOverlay.style.width = `${rect.width}px`;
            this.highlightOverlay.style.height = `${rect.height}px`;

            return false;
        };

        // Store listeners for later removal
        this.selectionEventListeners = [
            {type: 'mouseover', handler: handleMouseOver, capture: true},
            {type: 'mouseout', handler: handleMouseOut, capture: true},
            {type: 'click', handler: handleClick, capture: true}
        ];

        this.selectionEventListeners.forEach(listener => {
            document.addEventListener(
                listener.type,
                listener.handler,
                listener.capture
            );
        });

        this.isSelectionActive = true;
        this.isSelectionLocked = false;
        return true;
    }

    /**
     * Lock the current selection, allowing interaction with other elements
     * @returns {boolean} - Whether the selection was successfully locked
     */
    static lockSelection() {
        if (!this.isSelectionActive || this.isSelectionLocked) {
            return false;
        }
        
        this.isSelectionLocked = true;
        return true;
    }

    /**
     * Unlock the current selection, allowing selection of new elements
     * @returns {boolean} - Whether the selection was successfully unlocked
     */
    static unlockSelection() {
        if (!this.isSelectionActive || !this.isSelectionLocked) {
            return false;
        }
        
        this.isSelectionLocked = false;
        return true;
    }

    /**
     * Remove selection tool from the page
     * @returns {boolean} - Whether the tool was successfully removed
     */
    static deactivateSelection() {
        if (!this.isSelectionActive) {
            return false;
        }

        // Remove event listeners
        this.selectionEventListeners.forEach(listener => {
            document.removeEventListener(
                listener.type,
                listener.handler,
                listener.capture
            );
        });

        // Remove overlay
        if (this.highlightOverlay && this.highlightOverlay.parentNode) {
            this.highlightOverlay.parentNode.removeChild(this.highlightOverlay);
        }

        this.highlightOverlay = null;
        this.selectionEventListeners = [];
        this.selectedElement = null;
        this.isSelectionActive = false;
        this.isSelectionLocked = false;
        return true;
    }

    /**
     * Print the currently selected element
     * @returns {Promise<boolean>} - Success status
     */
    static async printSelectedElement() {
        if (!this.selectedElement) {
            console.error('No element selected for printing.');
            return false;
        }

        return await this.printElementContent(this.selectedElement.outerHTML);
    }
}

window.GizmoWebJSInterop = window.GizmoWebJSInterop || {};
window.GizmoWebJSInterop.Printer = Printer;