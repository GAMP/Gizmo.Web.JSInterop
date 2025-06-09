using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class PrinterApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Printer";

    /// <summary>
    /// Prints a specific HTML element identified by a CSS selector
    /// </summary>
    /// <param name="selector">CSS selector for the element to print. To print by ID, use "#elementId". For classes, use ".className". For tag names, use "tagName".</param>
    /// <returns>True if the element was found and the print operation started</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElement(string selector) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementBySelector", selector);

    /// <summary>
    /// Prints a DOM element by reference
    /// </summary>
    /// <param name="element">Reference to the DOM element to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElement(ElementReference element) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementByReference", element);

    /// <summary>
    /// Prints arbitrary HTML content
    /// </summary>
    /// <param name="content">HTML content to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElementContent(string content) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementContent", content);

    /// <summary>
    /// Prints HTML content from a MarkupString
    /// </summary>
    /// <param name="content">Blazor MarkupString to print</param>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintElementContent(MarkupString content) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementContent", content.Value);

    /// <summary>
    /// Activates an interactive element selection tool on the page
    /// </summary>
    /// <param name="highlightColor">Optional highlight color (CSS color value)</param>
    /// <param name="highlightBorder">Optional highlight border style (CSS border value)</param>
    /// <returns>True if the selection tool was successfully added</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> ActivateSelection(string? highlightColor = null, string? highlightBorder = null) =>
        jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.ActivateSelection", new { highlightColor, highlightBorder });

    /// <summary>
    /// Deactivates the element selection tool
    /// </summary>
    /// <returns>True if the selection tool was successfully removed</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> DeactivateSelection() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.DeactivateSelection");

    /// <summary>
    /// Prints the currently selected element
    /// </summary>
    /// <returns>True if the print operation started successfully</returns>
    /// <exception cref="JSException">Thrown when JavaScript interop encounters an error</exception>
    /// <exception cref="JSDisconnectedException">Thrown if the JavaScript runtime is disconnected</exception>
    /// <exception cref="TaskCanceledException">Thrown if the operation is canceled</exception>
    public ValueTask<bool> PrintSelectedElement() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintSelectedElement");
}