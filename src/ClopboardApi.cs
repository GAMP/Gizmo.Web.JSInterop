using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class ClipboardApi
{
    private const string NAMESPACE = "GizmoWebJSInterop.Clipboard";
    
    private readonly ILogger _logger;
    private readonly IJSRuntime _jsRuntime;

    public ClipboardApi(ILogger logger, IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
        _logger = logger;
    }

    /// <summary>
    /// Checks if read permission is available
    /// </summary>
    /// <returns>True if read permission is available or may be prompted</returns>
    public async Task<bool> CanRead()
    {
        try
        {
            return await _jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanRead");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check clipboard read permission");
            return false;
        }
    }

    /// <summary>
    /// Checks if write permission is available
    /// </summary>
    /// <returns>True if write permission is available or may be prompted</returns>
    public async Task<bool> CanWrite()
    {
        try
        {
            return await _jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.CanWrite");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check clipboard write permission");
            return false;
        }
    }

    /// <summary>
    /// Reads text data from the clipboard
    /// </summary>
    /// <returns>Text content from the clipboard</returns>
    public async Task<string> ReadText()
    {
        try
        {
            return await _jsRuntime.InvokeAsync<string>($"{NAMESPACE}.ReadText");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read text from clipboard");
            return string.Empty;
        }
    }

    /// <summary>
    /// Writes text data to the clipboard
    /// </summary>
    /// <param name="text">The text to write to clipboard</param>
    public async Task WriteText(string text)
    {
        try
        {
            await _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteText", text);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write text to clipboard");
        }
    }

    /// <summary>
    /// Reads image data from the clipboard
    /// </summary>
    /// <returns>Image data as byte array or null if no image is available</returns>
    public async Task<byte[]?> ReadImage()
    {
        try
        {
            var imageReference = await _jsRuntime.InvokeAsync<IJSObjectReference>($"{NAMESPACE}.ReadImage");
            return await imageReference.InvokeAsync<byte[]>("arrayBuffer");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read image from clipboard");
            return null;
        }
    }

    /// <summary>
    /// Writes image data to the clipboard
    /// </summary>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    public async Task WriteImage(byte[] imageData, string mimeType = "image/png")
    {
        try
        {
            var imageArray = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);
            var blob = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
            await _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteImage", blob);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write image to clipboard");
        }
    }

    /// <summary>
    /// Writes both text and image to the clipboard
    /// </summary>
    /// <param name="text">Text to write to the clipboard</param>
    /// <param name="imageData">The image data as byte array</param>
    /// <param name="mimeType">The MIME type of the image (default: image/png)</param>
    public async Task WriteMultiple(string text, byte[] imageData, string mimeType = "image/png")
    {
        try
        {
            var imageArray = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Uint8Array", imageData);
            var blob = await _jsRuntime.InvokeAsync<IJSObjectReference>("new Blob", new[] { imageArray }, new { type = mimeType });
            await _jsRuntime.InvokeVoidAsync($"{NAMESPACE}.WriteMultiple", text, blob);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write multiple items to clipboard");
        }
    }
}
