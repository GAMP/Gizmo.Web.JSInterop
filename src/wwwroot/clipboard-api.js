/** @format */

class Clipboard {
    /**
     * Check if read permission is available
     * @returns {Promise<boolean>} True if clipboard read permission is granted or can be prompted
     */
    static async CanRead() {
        const result = await navigator.permissions.query({name: 'clipboard-read'});
        return result.state === 'granted' || result.state === 'prompt';
    }

    /**
     * Check if write permission is available
     * @returns {Promise<boolean>} True if clipboard write permission is granted or can be prompted
     */
    static async CanWrite() {
        try {
            const result = await navigator.permissions.query({name: 'clipboard-write'});
            return result.state === 'granted' || result.state === 'prompt';
        } catch {
            // Some browsers don't support permission querying for clipboard
            // Fall back to checking if clipboard API is available
            return !!navigator.clipboard;
        }
    }

    /**
     * Read text data from the clipboard
     * @returns {Promise<string>} The text content from the clipboard
     */
    static ReadText = () => navigator.clipboard.readText();

    /**
     * Write text data to the clipboard
     * @param {string} text - The text to write to clipboard
     * @returns {Promise<void>}
     */
    static WriteText = text => navigator.clipboard.writeText(text);

    /**
     * Read image data from the clipboard
     * @returns {Promise<Blob|null>} The image blob or null if no image is available
     */
    static async ReadImage() {
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
    }

    /**
     * Write image data to the clipboard
     * @param {Blob} imageBlob - The image blob to write to clipboard
     * @returns {Promise<void>}
     */
    static WriteImage = async imageBlob => {
        const item = new ClipboardItem({
            [imageBlob.type]: imageBlob,
        });
        return navigator.clipboard.write([item]);
    }

    /**
     * Write both text and image to clipboard
     * @param {string} text - Text to write to clipboard
     * @param {Blob} imageBlob - Image to write to clipboard
     * @returns {Promise<void>}
     */
    static WriteMultiple = async (text, imageBlob) => {
        const textBlob = new Blob([text], {type: 'text/plain'});
        const item = new ClipboardItem({
            'text/plain': textBlob,
            [imageBlob.type]: imageBlob,
        });
        return navigator.clipboard.write([item]);
    }
}

window.GizmoWebJSInterop = class GizmoWebJSInterop {
    static Clipboard = Clipboard;
};