using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace StatusMonitor.Services;

using StatusMonitor.Models;

public static class IdentityServiceExtensions
{
    public static IServiceCollection
        AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<StatusMonitorDb>();

        services.AddIdentityCore<AppUser>(opt => { opt.Password.RequiredLength = 8; })
            .AddEntityFrameworkStores<StatusMonitorDb>();

        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
                options.LoginPath = null; // Disable automatic redirect to login
                options.AccessDeniedPath = null; // Prevent redirection on access denied
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization(options =>
        {
            // Require all users to be authenticated
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        return services;
    }
}