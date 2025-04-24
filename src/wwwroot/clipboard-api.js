/** @format */

class Clipboard {
    /**
     * Check if read permission is available
     * @returns {Promise<boolean>} True if clipboard read permission is granted or can be prompted
     */
    static async CanRead() {
        try {
            const result = await navigator.permissions.query({name: 'clipboard-read'});
            return result.state === 'granted' || result.state === 'prompt';
        } catch (error) {
            console.error('Failed to check clipboard permission: ', error);
            throw error;
        }
    }

    /**
     * Check if write permission is available
     * @returns {Promise<boolean>} True if clipboard write permission is granted or can be prompted
     */
    static async CanWrite() {
        try {
            const result = await navigator.permissions.query({name: 'clipboard-write'});
            return result.state === 'granted' || result.state === 'prompt';
        } catch (error) {
            // Some browsers don't support permission querying for clipboard
            console.warn('Failed to query clipboard-write permission: ', error);
            // Fall back to checking if clipboard API is available
            return !!navigator.clipboard;
        }
    }

    /**
     * Read text data from the clipboard
     * @returns {Promise<string>} The text content from the clipboard
     */
    static async ReadText() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            console.error('Failed to read from clipboard: ', error);
            throw error;
        }
    }

    /**
     * Write text data to the clipboard
     * @param {string} text - The text to write to clipboard
     * @returns {Promise<void>}
     */
    static async WriteText(text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Text written to clipboard successfully: ', text);
        } catch (error) {
            console.error('Failed to write to clipboard: ', error);
            throw error;
        }
    }

    /**
     * Read image data from the clipboard
     * @returns {Promise<Blob|null>} The image blob or null if no image is available
     */
    static async ReadImage() {
        try {
            const clipboardItems = await navigator.clipboard.read();

            // Find image types in clipboard data
            for (const item of clipboardItems) {
                // Check for common image types
                for (const type of ['image/png', 'image/jpeg', 'image/gif', 'image/webp']) {
                    if (item.types.includes(type)) {
                        return await item.getType(type);
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Failed to read image from clipboard: ', error);
            throw error;
        }
    }

    /**
     * Write image data to the clipboard
     * @param {Blob} imageBlob - The image blob to write to clipboard
     * @returns {Promise<void>}
     */
    static async WriteImage(imageBlob) {
        try {
            const item = new ClipboardItem({
                [imageBlob.type]: imageBlob,
            });
            await navigator.clipboard.write([item]);
        } catch (error) {
            console.error('Failed to write image to clipboard: ', error);
            throw error;
        }
    }

    /**
     * Write both text and image to clipboard
     * @param {string} text - Text to write to clipboard
     * @param {Blob} imageBlob - Image to write to clipboard
     * @returns {Promise<void>}
     */
    static async WriteMultiple(text, imageBlob) {
        try {
            const textBlob = new Blob([text], {type: 'text/plain'});
            const item = new ClipboardItem({
                'text/plain': textBlob,
                [imageBlob.type]: imageBlob,
            });
            await navigator.clipboard.write([item]);
        } catch (error) {
            console.error('Failed to write multiple items to clipboard: ', error);
            throw error;
        }
    }
}

window.GizmoWebJSInterop = class GizmoWebJSInterop {
    static Clipboard = Clipboard;
};

