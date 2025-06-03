using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop;

public class PrinterApi(IJSRuntime jsRuntime)
{
    private const string NAMESPACE = "GizmoWebJSInterop.Printer";
}