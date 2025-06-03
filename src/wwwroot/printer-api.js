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
                console.error(`Element not found: ${selector}`);
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
                console.error('Invalid element reference');
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
                <html>
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
                // Listen for the afterprint event
                iframe.contentWindow.addEventListener('afterprint', () => {
                    document.body.removeChild(iframe);
                    resolve(true);
                }, {once: true});

                // Fallback if afterprint doesn't fire within 5 seconds
                const timeoutId = setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                        resolve(true);
                    }
                }, 5000);

                // Wait for content to load, then print
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

    // Element selection tool variables
    static selectionToolActive = false;
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
    static addSelectionTool(options = {}) {
        if (this.selectionToolActive) {
            return false;
        }

        const defaultOptions = {
            highlightColor: 'rgba(74, 144, 226, 0.3)',
            highlightBorder: '2px dashed #4a90e2'
        };

        const config = {...defaultOptions, ...options};

        // Create highlight overlay
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
            if (event.target === document.body || event.target === document.documentElement) {
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
            this.highlightOverlay.style.display = 'none';
        };

        const handleClick = (event) => {
            if (event.target === document.body || event.target === document.documentElement) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.selectedElement = event.target;

            // Provide visual feedback of selection
            const originalBorder = event.target.style.border;
            event.target.style.border = config.highlightBorder;

            setTimeout(() => {
                event.target.style.border = originalBorder;
            }, 500);

            return false;
        };

        // Register listeners
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);

        // Store listeners for later removal
        this.selectionEventListeners = [
            {type: 'mouseover', handler: handleMouseOver, capture: true},
            {type: 'mouseout', handler: handleMouseOut, capture: true},
            {type: 'click', handler: handleClick, capture: true}
        ];

        this.selectionToolActive = true;
        return true;
    }

    /**
     * Remove selection tool from the page
     * @returns {boolean} - Whether the tool was successfully removed
     */
    static removeSelectionTool() {
        if (!this.selectionToolActive) {
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
        this.selectionToolActive = false;
        return true;
    }

    /**
     * Get the CSS selector for the currently selected element
     * @returns {string|null} - CSS selector or null if no element selected
     */
    static getSelectedElementSelector() {
        if (!this.selectedElement) {
            return null;
        }

        // Generate a specific selector for the element
        let selector = '';
        let element = this.selectedElement;

        while (element && element !== document.documentElement) {
            let elementSelector = element.tagName.toLowerCase();

            // Add ID if available
            if (element.id) {
                elementSelector += `#${element.id}`;
            } else {
                // Add classes if available
                if (element.className && typeof element.className === 'string') {
                    elementSelector += `.${element.className.trim().replace(/\s+/g, '.')}`;
                }

                // Add position among siblings of same type
                const siblings = Array.from(
                    element.parentNode.children
                ).filter(el => el.tagName === element.tagName);

                if (siblings.length > 1) {
                    const index = siblings.indexOf(element) + 1;
                    elementSelector += `:nth-of-type(${index})`;
                }
            }

            selector = elementSelector + (selector ? ' > ' + selector : '');
            element = element.parentNode;
        }

        return selector;
    }

    /**
     * Print the currently selected element
     * @returns {Promise<boolean>} - Success status
     */
    static async printSelectedElement() {
        if (!this.selectedElement) {
            console.error('No element selected');
            return false;
        }

        return await this.printElementContent(this.selectedElement.outerHTML);
    }
}

window.GizmoWebJSInterop = window.GizmoWebJSInterop || {};
window.GizmoWebJSInterop.Printer = Printer;
