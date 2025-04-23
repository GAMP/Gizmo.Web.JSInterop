using Microsoft.JSInterop;

namespace Gizmo.Web.JSInterop
{
    /// <summary>
    /// Handles importing JavaScript modules from the Gizmo.Web.JSInterop library
    /// </summary>
    public class JsImporter(IJSRuntime? jsRuntime)
    {
        private const string BASE_URL = "_content/Gizmo.Web.JSInterop/";

        private readonly IJSRuntime _jsRuntime = jsRuntime ?? throw new ArgumentNullException(nameof(jsRuntime));

        private static readonly AsyncLocal<bool> Initialized = new();

        private async Task Initialize(CancellationToken ct)
        {
            if (!Initialized.Value)
            {
                await _jsRuntime.InvokeVoidAsync("import", ct, $"{BASE_URL}clipboard-api.js");

                Initialized.Value = true;
            }
        }

        /// <summary>
        /// Initializes the JS resources by injecting script tags for required libraries
        /// </summary>
        /// <param name="ct">Cancellation token to cancel the operation</param>
        public Task Import(CancellationToken ct = default)
        {
            try
            {
                return Initialize(ct);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to initialize JavaScript modules: {ex.Message}", ex);
            }
        }
    }
}
