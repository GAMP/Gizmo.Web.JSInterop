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

The library ships its JavaScript as static web assets under `_content/Gizmo.Web.JSInterop/`. Register the script in your host page (`index.html`, `_Host.cshtml`, or `App.razor`) before the first interop call:

```html
<script src="_content/Gizmo.Web.JSInterop/clipboard-api.js"></script>
```

The minified file (`clipboard-api.min.js`) exposes the same namespace.

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

#### Browser Compatibility

The Clipboard API relies on the browser's implementation of the Clipboard API. Functionality may vary depending on:
- Browser vendor and version
- Security context (HTTPS is generally required)
- User permissions and browser settings

Most modern browsers (Chrome, Edge, Firefox, Safari) support the core clipboard functionality, but permission handling may differ between implementations.

## Publishing

`.github/workflows/package.yml` is the caller copy of the canonical Gizmo.Infra NuGet procedure; follow [`docs/caller.md`](https://github.com/GAMP/Gizmo.Infra/blob/4cf658f3ae09069730cefc7232cacd12a52bd1da/docs/caller.md) for prerequisites, routing, and version rules.

Merging into `pre-release` publishes a `2.0.0-preview.N` prerelease to NuGet.org, so the merge is a real publication and not only a build; the stable `2.0.0` package comes from a merge into `release`.

## License

MIT License. See the `LICENSE` file in the repository root.
