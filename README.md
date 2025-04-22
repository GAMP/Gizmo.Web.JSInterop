# Gizmo.Web.JSInterop

A .NET library providing JavaScript interoperability functions for Blazor applications.

## Features

### Clipboard API

The library provides comprehensive clipboard functionality for Blazor applications:

- Check clipboard read/write permissions
- Read text from clipboard
- Write text to clipboard
- Read images from clipboard
- Write images to clipboard
- Write multiple formats (text and image) simultaneously

## Usage

### Installation

Add a reference to the Gizmo.Web.JSInterop package in your Blazor project:

```bash
dotnet add package Gizmo.Web.JSInterop
```

### Register Services

In your Blazor application's `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddScoped<Gizmo.Web.JSInterop.ClipboardApi>();
```

### Import JavaScript

In your `_Imports.razor` or component:

```razor
@using Gizmo.Web.JSInterop
```

### Use the Clipboard API

```csharp
@inject ClipboardApi ClipboardApi

@code {
    private async Task CopyTextToClipboard(string text)
    {
        if (await ClipboardApi.CanWrite())
        {
            await ClipboardApi.WriteText(text);
        }
    }

    private async Task<string> GetTextFromClipboard()
    {
        if (await ClipboardApi.CanRead())
        {
            return await ClipboardApi.ReadText();
        }
        return string.Empty;
    }
}
```

## Requirements

- .NET 9.0
- Blazor WebAssembly or Blazor Server

## Browser Compatibility

The Clipboard API relies on the browser's implementation of the Clipboard API. Functionality may vary depending on the browser and security context (HTTPS is generally required for clipboard operations).
