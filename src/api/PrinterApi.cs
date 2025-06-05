using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class PrinterApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Printer";

    /// <summary>
    /// Prints a specific HTML element identified by a CSS selector
    /// </summary>
    /// <param name="selector">CSS selector for the element to print</param>
    /// <returns>True if the element was found and print operation started</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElement(string selector) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.printElementBySelector", selector);

    /// <summary>
    /// Prints a DOM element by reference
    /// </summary>
    /// <param name="elementReference">Reference to the DOM element to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElement(ElementReference elementReference) =>
        jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.printElementByReference", elementReference);

    /// <summary>
    /// Prints a specific HTML element identified by its ID.
    /// </summary>
    /// <param name="elementId">ID of the element to print (without the # prefix)</param>
    /// <returns>True if the element was found and print operation started</returns>
    /// <exception cref="ArgumentNullException">Thrown if elementId is null or empty</exception>
    public ValueTask<bool> PrintElementById(string elementId)
    {
        if (string.IsNullOrWhiteSpace(elementId))
        {
            throw new ArgumentNullException(nameof(elementId), "Element ID cannot be null or empty.");
        }

        return PrintElement($"#{elementId}");
    }

    /// <summary>
    /// Prints arbitrary HTML content
    /// </summary>
    /// <param name="htmlContent">HTML content to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElementContent(string htmlContent) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.printElementContent", htmlContent);

    /// <summary>
    /// Prints HTML content from a MarkupString
    /// </summary>
    /// <param name="markupString">Blazor MarkupString to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElementContent(MarkupString markupString) =>
        jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.printElementContent", markupString.Value);

    /// <summary>
    /// Activates an interactive element selection tool on the page
    /// </summary>
    /// <param name="highlightColor">Optional highlight color (CSS color value)</param>
    /// <param name="highlightBorder">Optional highlight border style (CSS border value)</param>
    /// <returns>True if the selection tool was successfully added</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> ActivateSelection(string? highlightColor = null, string? highlightBorder = null)
    {
        var options = new { highlightColor, highlightBorder };

        return jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.activateSelection", options);
    }

    /// <summary>
    /// Deactivates the element selection tool
    /// </summary>
    /// <returns>True if the selection tool was successfully removed</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> DeactivateSelection() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.deactivateSelection");

    /// <summary>
    /// Prints the currently selected element
    /// </summary>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintSelectedElement() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.printSelectedElement");
}