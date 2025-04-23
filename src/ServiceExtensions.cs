using Microsoft.Extensions.DependencyInjection;

namespace Gizmo.Web.JSInterop
{
    public static class ServiceExtensions
    {
        /// <summary>
        /// Adds Gizmo.Web.JSInterop services to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection AddGizmoJsInterop(this IServiceCollection services)
        {
            services.AddScoped<JsImporter>();
            services.AddScoped<ClipboardApi>();
            
            return services;
        }
    }
}
