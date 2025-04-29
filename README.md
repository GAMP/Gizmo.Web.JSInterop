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
