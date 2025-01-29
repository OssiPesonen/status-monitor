using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StatusMonitor.DTO;
using StatusMonitor.Models;

namespace StatusMonitor;

public class Router
{
    private const string AuthIndicatorCookieName = "isLoggedIn";
    
    // Refresh the authentication indicator cookie for the front-end app
    // if the user is logged in and a request comes through. The auth cookie
    // itself has a sliding expiration window already.
    private static void RefreshAuthSessionCookie(HttpContext context)
    {
        var email = context.User.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrEmpty(email))
        {
            context.Response.Cookies.Append(AuthIndicatorCookieName, "true", new CookieOptions
            {
                HttpOnly = false,
                Secure = context.Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/",
                Domain = "localhost",
                Expires = DateTime.UtcNow.AddMinutes(60),
            });
        }
    }

    public static void AddRoutes(WebApplication app)
    {

        app.MapGet("/sites", async (StatusMonitorDb db) => await db.Sites.ToListAsync());

        app.MapPost("/sites", async (Site site, StatusMonitorDb db) =>
        {
            await db.Sites.AddAsync(site);
            await db.SaveChangesAsync();
            return Results.Created($"/sites/{site.Id}", site);
        });

        app.MapGet("/site/{id}", async (StatusMonitorDb db, int id) =>
        {
            var site = await db.Sites.FindAsync(id);

            if (site != null)
            {
                var statuses = await db.Statuses.Where(s => s.SiteId == site.Id).ToListAsync();
                site.Statuses = statuses;
            }

            return site;
        });

        app.MapDelete("/site/{id}", async (StatusMonitorDb db, int id) =>
        {
            var site = await db.Sites.FindAsync(id);
            if (site != null)
            {
                db.Sites.Remove(site);
            }

            await db.SaveChangesAsync();
            return Results.Ok();
        });

        app.MapGet("/statuses", async (StatusMonitorDb db) =>
        {
            var statuses = await db.Statuses.ToListAsync();
            return statuses.OrderByDescending(c => c.Time);
        });

        app.MapGet("/user/profile", async (UserManager<AppUser> userManager, HttpContext context) =>
        {
            var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return Results.Unauthorized();

            return Results.Ok(new UserDTO
            {
                Email = user.Email!,
                DisplayName = user.DisplayName!,
            });
        });

        app.MapPost("/auth/logout", async (HttpContext context) =>
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            context.Response.Cookies.Delete(AuthIndicatorCookieName);
            return Results.Ok();
        });

        //
        // Anonymous access endpoints
        //

        app.MapPost("/auth/register", [AllowAnonymous] async (RegisterDTO register, UserManager<AppUser> userManager) =>
        {
            // Check if user already exists. You should not do this if your app is publicly available,
            // and instead verify email addresses, and simply respond with "ok" so people can't fish for emails
            var existingUser = await userManager.FindByEmailAsync(register.Email);
            if (existingUser != null) return Results.BadRequest("Email already exists");

            var user = new AppUser
            {
                Email = register.Email,
                UserName = register.Email,
                DisplayName = register.DisplayName!,
            };

            var result = await userManager.CreateAsync(user, register.Password);
            return result.Succeeded ? Results.Created() : Results.BadRequest("Problem registering user");
        });

        app.MapPost("/auth/login", [AllowAnonymous]
            async (UserManager<AppUser> userManager, HttpContext context, LoginDTO login) =>
            {
                var user = await userManager.FindByEmailAsync(login.Email);
                if (user == null) return Results.Unauthorized();

                var isValidPassword = await userManager.CheckPasswordAsync(user, login.Password);
                if (!isValidPassword) return Results.Unauthorized();

                // Add info about the entity (user)
                var claims = new List<Claim>
                {
                    new(ClaimTypes.Email, user.Email!),
                    new(ClaimTypes.Name, user.DisplayName!),
                    new(ClaimTypes.Role, "User")
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                // Sign in the user (this creates the session)
                await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);

                // Create a cookie to indicate to the front-end app that the user is signed in
                context.Response.Cookies.Append(AuthIndicatorCookieName, "true", new CookieOptions
                {
                    HttpOnly = false, // Allows JavaScript access
                    Secure = context.Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
                    Domain = "localhost",
                    Path = "/",
                    Expires = DateTimeOffset.UtcNow.AddMinutes(60),
                });

                return Results.Ok();
            });

        app.Use((context, next) =>
        {
            RefreshAuthSessionCookie(context);
            return next(context);
        });
    }
}