# Gizmo.Web.JSInterop

A .NET library providing JavaScript interoperability functions for Blazor applications.

## Requirements

- .NET 9.0
- Blazor WebAssembly or Blazor Server

## Installation

Add a reference to the Gizmo.Web.JSInterop package in your Blazor project:

```bash
dotnet add package Gizmo.Web.JSInterop
```

## Asset setup

The library ships its JavaScript as static web assets under `_content/Gizmo.Web.JSInterop/`. Register the script for each API in your host page (`index.html`, `_Host.cshtml`, or `App.razor`) before the first interop call:

```html
<script src="_content/Gizmo.Web.JSInterop/clipboard-api.js"></script>
<script src="_content/Gizmo.Web.JSInterop/printer-api.js"></script>
```

The minified files (`clipboard-api.min.js`, `printer-api.min.js`) expose the same namespaces. The Printer API loads `_content/Gizmo.Web.JSInterop/lib/html2canvas.min.js` automatically when the printer script loads and waits for it before capturing, so that file needs no separate tag.

## Features

### Clipboard API

- **Permission Management**
  - Check clipboard read permissions
  - Check clipboard write permissions
  
- **Text Operations**
  - Read text from clipboard
  - Write text to clipboard
  
- **Image Operations**
  - Read images from clipboard
  - Write images to clipboard
  
- **Advanced Operations**
  - Write multiple formats (text and image) simultaneously

### Printer API

- **Element Printing**
  - Print specific HTML elements
  - Print arbitrary HTML content
  
- **Element Selection**
  - Interactive element selection
  - Print selected element


### Usage Examples

#### Basic Clipboard Operations

```csharp
@inject IJSRuntime jsRuntime

@code {
    var clipboardApi = new ClipboardApi(jsRuntime);
    
    private async Task CopyTextToClipboard(string text)
    {
        if (await clipboardApi.CanWrite())
        {
            await clipboardApi.WriteText(text);
        }
    }

    private async Task<string> GetTextFromClipboard()
    {
        if (await clipboardApi.CanRead())
        {
            return await clipboardApi.ReadText();
        }
        return string.Empty;
    }
}
```

#### Working with Images

```csharp
@inject IJSRuntime jsRuntime

@code {
    var clipboardApi = new ClipboardApi(jsRuntime);
    
    private async Task CopyImageToClipboard(byte[] imageData)
    {
        if (await clipboardApi.CanWrite())
        {
            await clipboardApi.WriteImage(imageData, "image/png");
        }
    }
    
    private async Task<byte[]?> GetImageFromClipboard()
    {
        if (await clipboardApi.CanRead())
        {
            return await clipboardApi.ReadImage();
        }
        return null;
    }
}
```

#### Printing HTML Elements

```csharp
@inject IJSRuntime jsRuntime

@code {
    var printerApi = new PrinterApi(jsRuntime);
    private ElementReference myElement;
    
    private async Task PrintElement()
    {
        await printerApi.PrintElement("#my-element");
        await printerApi.PrintElement(myElement);
    }
    
    private async Task PrintElementContent()
    {
        string htmlContent = "<h1>Custom Report</h1><p>This is a test report.</p>";
        await printerApi.PrintElementContent(htmlContent);
    }
}
```

#### Using the Element Selection Tool

```csharp
@inject IJSRuntime jsRuntime
@page "/element-selector"

<div class="controls">
    <button @onclick="ActivateSelection">Select Element</button>
    <button @onclick="DeactivateSelection">Cancel Selection</button>
    <button @onclick="PrintSelectedElement">Print Selected Element</button>
</div>

<div class="content-area">
    <div id="printable-area">
        <h2>Sample Content</h2>
        <p>This is a sample paragraph that you can select and print.</p>
        <table border="1">
            <tr>
                <th>Header 1</th>
                <th>Header 2</th>
            </tr>
            <tr>
                <td>Data 1</td>
                <td>Data 2</td>
            </tr>
        </table>
    </div>
</div>

@code {
    var printerApi = new PrinterApi(jsRuntime);
    
    private async Task ActivateSelection()
    {
        await printerApi.ActivateSelection(
            highlightColor: "rgba(255, 193, 7, 0.3)",
            highlightBorder: "2px dashed #ffc107"
        );
    }
    
    private async Task DeactivateSelection()
    {
        await printerApi.DeactivateSelection();
    }
    
    private async Task PrintSelectedElement()
    {
        await printerApi.PrintSelectedElement();
    }
}
```

#### Browser Compatibility

The Clipboard API relies on the browser's implementation of the Clipboard API. Functionality may vary depending on:
- Browser vendor and version
- Security context (HTTPS is generally required)
- User permissions and browser settings

Most modern browsers (Chrome, Edge, Firefox, Safari) support the core clipboard functionality, but permission handling may differ between implementations.

The Printer API uses standard browser printing functionality but may have limitations:
- Printing rasterizes the target to a PNG image, so the output has no selectable text and some CSS features may not render faithfully
- Selection tools work best in modern browsers with proper event handling

## Printer API limitations

The Printer API captures the target element with the bundled `html2canvas`, converts it to a PNG data URL, and prints that image. Consider the following before using it:

- **`PrintElementContent` accepts trusted HTML only.** The content is assigned to a detached element's `innerHTML`; scripts do not execute, but inline event handlers and other markup do. Never pass untrusted or user-supplied HTML. The `MarkupString` overload behaves identically.
- **The selection tool installs global listeners.** `ActivateSelection` registers capture-phase `mouseover`, `mouseout`, and `click` listeners on `document` and cancels default action and propagation for clicks on links, buttons, and inputs while it is active. Always call `DeactivateSelection` (for example in `Dispose`/`DisposeAsync` or component teardown) to remove the listeners; otherwise host-page interaction stays affected. `ActivateSelection` returns `false` when the tool is already active, and `DeactivateSelection` returns `false` when it is not.
- **Canvas and cross-origin images.** The element is rendered with `html2canvas` (`allowTaint`/`useCORS` enabled) and then read with `toDataURL('image/png')`. Cross-origin images can taint the canvas so the conversion throws, in which case the call returns `false`. Serve such images with permissive CORS headers or avoid them.
- **Printing is asynchronous.** Printing uses a temporary hidden iframe and `window.print()`. The `PrintElement*` methods resolve `true` when printing finishes or after a five-second fallback, and `false` on failure.

## Publishing

`.github/workflows/package.yml` is the caller copy of the canonical Gizmo.Infra NuGet procedure; follow [`docs/caller.md`](https://github.com/GAMP/Gizmo.Infra/blob/4cf658f3ae09069730cefc7232cacd12a52bd1da/docs/caller.md) for prerequisites, routing, and version rules.

Merging into `pre-release` publishes a `2.0.0-preview.N` prerelease to NuGet.org, so the merge is a real publication and not only a build; the stable `2.0.0` package comes from a merge into `release`.

## Third-party notices

`src/wwwroot/lib/html2canvas.min.js` bundles html2canvas 1.4.1 (Copyright (c) 2022 Niklas von Hertzen, MIT License) and an embedded copy of Microsoft tslib under its permissive notice. The bundled file retains both notices in its header.

## License

MIT License. See the `LICENSE` file in the repository root.
