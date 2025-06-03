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

### Printer API

- **Element Printing**
  - Print specific HTML elements using CSS selectors
  - Print arbitrary HTML content
  
- **Element Selection**
  - Interactive element selector tool
  - Get CSS selector for selected elements
  - Print selected elements


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
    private PrinterApi printerApi;
    
    protected override void OnInitialized()
    {
        printerApi = new PrinterApi(jsRuntime);
    }
    
    // Print an element by CSS selector
    private async Task PrintSpecificElement()
    {
        await printerApi.PrintElement("#my-element");
    }
    
    // Print custom HTML content
    private async Task PrintCustomContent()
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
    <button @onclick="ActivateSelectionTool">Select Element</button>
    <button @onclick="DeactivateSelectionTool">Cancel Selection</button>
    <button @onclick="PrintSelectedElement">Print Selected Element</button>
</div>

<div class="status">
    @if (!string.IsNullOrEmpty(selectedElementSelector))
    {
        <p>Selected element: <code>@selectedElementSelector</code></p>
    }
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
    private PrinterApi printerApi;
    private string? selectedElementSelector;
    
    protected override void OnInitialized()
    {
        printerApi = new PrinterApi(jsRuntime);
    }
    
    private async Task ActivateSelectionTool()
    {
        await printerApi.AddSelectionTool(
            highlightColor: "rgba(255, 193, 7, 0.3)",
            highlightBorder: "2px dashed #ffc107"
        );
    }
    
    private async Task DeactivateSelectionTool()
    {
        await printerApi.RemoveSelectionTool();
    }
    
    private async Task PrintSelectedElement()
    {
        selectedElementSelector = await printerApi.GetSelectedElementSelector();
        if (!string.IsNullOrEmpty(selectedElementSelector))
        {
            await printerApi.PrintSelectedElement();
        }
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
- Popup blockers can interfere with the print window
- Some styling might not be preserved when printing
- Selection tools work best in modern browsers with proper event handling
