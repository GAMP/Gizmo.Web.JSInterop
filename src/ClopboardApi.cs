using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class ClipboardApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Clipboard";

    /// <summary>
    /// Checks if read permission is available
    /// </summary>
    /// <returns>True if read permission is available or may be prompted</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> CanRead() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanRead");
    
    /// <summary>
    /// Checks if write permission is available
    /// </summary>
    /// <returns>True if write permission is available or may be prompted</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> CanWrite() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanWrite");
    
    /// <summary>
    /// Reads text data from the clipboard
    /// </summary>
    /// <returns>Text content from the clipboard</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error or clipboard permission is denied</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<string> ReadText() => jsRuntime.InvokeAsync<string>($"{NAMESPACE}.ReadText");
    
    /// <summary>
    /// Writes text data to the clipboard
    /// </summary>
    /// <param name="text">The text to write to clipboard</param>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error or clipboard permission is denied</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    /// <exception cref="ArgumentNullException">Thrown if text parameter is null</exception>
    public ValueTask WriteText(string text) => jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteText", text);
    
    /// <summary>
    /// Reads image data from the clipboard
    /// </summary>
    /// <returns>Image data as byte array or null if no image is available</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error or clipboard permission is denied</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    /// <exception cref="ArgumentException">Thrown if the clipboard data cannot be converted to a valid image format</exception>
    public async Task<byte[]?> ReadImage()
    {
        var imageReference = await jsRuntime.InvokeAsync<IJSObjectReference>($"{NAMESPACE}.ReadImage");
        return await imageReference.InvokeAsync<byte[]>("arrayBuffer");
    }
    
    /// <summary>
    /// Writes image data to the clipboard
    /// </summary>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error or clipboard permission is denied</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    /// <exception cref="ArgumentNullException">Thrown if imageData is null</exception>
    /// <exception cref="ArgumentException">Thrown if imageData is invalid or mimeType is not supported</exception>
    public async Task WriteImage(byte[] imageData, string mimeType = "image/png")
    {
        var imageArray = await jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);
        var blob = await jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
        await jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteImage", blob);
    }
    
    /// <summary>
    /// Writes both text and image to the clipboard
    /// </summary>
    /// <param name="text">Text to write to the clipboard</param>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error or clipboard permission is denied</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    /// <exception cref="ArgumentNullException">Thrown if text or imageData is null</exception>
    /// <exception cref="ArgumentException">Thrown if imageData is invalid or mimeType is not supported</exception>
    public async Task WriteMultiple(string text, byte[] imageData, string mimeType = "image/png")
    {
        var imageArray = await jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);
        var blob = await jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
        await jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteMultiple", text, blob);
    }
}
