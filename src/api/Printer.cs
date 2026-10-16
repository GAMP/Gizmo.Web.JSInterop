using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class PrinterApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Printer";

    /// <summary>Prints the element matched by a CSS selector.</summary>
    public ValueTask<bool> PrintElement(string selector) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementBySelector", selector);

    public ValueTask<bool> PrintElement(ElementReference element) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementByReference", element);

    /// <summary>Assigns the content to a detached element's innerHTML, so untrusted or user-supplied HTML must never be passed.</summary>
    public ValueTask<bool> PrintElementContent(string content) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementContent", content);

    /// <inheritdoc cref="PrintElementContent(string)"/>
    public ValueTask<bool> PrintElementContent(MarkupString content) => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintElementContent", content.Value);

    /// <summary>Registers document-level selection listeners that stay active until <see cref="DeactivateSelection"/> is called.</summary>
    public ValueTask<bool> ActivateSelection(string? highlightColor = null, string? highlightBorder = null) =>
        jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.ActivateSelection", new { highlightColor, highlightBorder });

    public ValueTask<bool> DeactivateSelection() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.DeactivateSelection");

    public ValueTask<bool> PrintSelectedElement() => jsRuntime.InvokeAsync<bool>($"{NAMESPACE}.PrintSelectedElement");
}
