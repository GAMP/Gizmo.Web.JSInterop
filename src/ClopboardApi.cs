using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class ClipboardApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Clipboard";
    private readonly IJSRuntime _jsRuntime = jsRuntime;

    /// <summary>
    /// Checks if read permission is available
    /// </summary>
    /// <returns>True if read permission is available or may be prompted</returns>
    public ValueTask<bool> CanRead() => _jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanRead");

    /// <summary>
    /// Checks if write permission is available
    /// </summary>
    /// <returns>True if write permission is available or may be prompted</returns>
    public ValueTask<bool> CanWrite() => _jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanWrite");

    /// <summary>
    /// Reads text data from the clipboard
    /// </summary>
    /// <returns>Text content from the clipboard</returns>
    public ValueTask<string> ReadText() => _jsRuntime.InvokeAsync<string>($"{NAMESPACE}.ReadText");

    /// <summary>
    /// Writes text data to the clipboard
    /// </summary>
    /// <param name="text">The text to write to clipboard</param>
    public ValueTask WriteText(string text) => _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteText", text);

    /// <summary>
    /// Reads image data from the clipboard
    /// </summary>
    /// <returns>Image data as byte array or null if no image is available</returns>
    public async ValueTask<byte[]?> ReadImage()
    {
        try
        {
            var imageReference = await _jsRuntime.InvokeAsync<IJSObjectReference>($"{NAMESPACE}.ReadImage");

            if (imageReference == null)
                return null;

            return await imageReference.InvokeAsync<byte[]>("arrayBuffer");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Writes image data to the clipboard
    /// </summary>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    public async ValueTask WriteImage(byte[] imageData, string mimeType = "image/png")
    {
        var imageArray = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);

        var blob = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
        
        await _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteImage", blob);
    }

    /// <summary>
    /// Writes both text and image to the clipboard
    /// </summary>
    /// <param name="text">Text to write to the clipboard</param>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    public async ValueTask WriteMultiple(string text, byte[] imageData, string mimeType = "image/png")
    {
        var imageArray = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);

        var blob = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
        
        await _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteMultiple", text, blob);
    }
}
