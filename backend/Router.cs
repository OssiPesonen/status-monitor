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

            return Results.Ok(new UserResponse
            {
                Email = user.Email!,
                DisplayName = user.DisplayName!,
            });
        });

        app.MapPut("/user/profile",
            async (UserManager<AppUser> userManager, HttpContext context, UpdateUserRequest updatedUser) =>
            {
                var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

                var user = await userManager.FindByEmailAsync(email);
                if (user == null) return Results.Unauthorized();

                user.DisplayName = updatedUser.DisplayName;
                await userManager.UpdateAsync(user);

                // Update password
                if (updatedUser is { Password: not null, NewPassword: not null })
                {
                    await userManager.ChangePasswordAsync(user, updatedUser.Password, updatedUser.NewPassword);
                }

                return Results.Ok();
            });

        app.MapPost("/auth/logout", async (HttpContext context) =>
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok();
        });

        //
        // Anonymous access endpoints
        //

        app.MapGet("/settings", [AllowAnonymous] async (UserManager<AppUser> userManager) =>
        {
            // Return system specific information
            var exists = await userManager.Users.FirstOrDefaultAsync();
            return Results.Ok(new SettingsResponse
            {
                RegistrationOpen = exists == null,
            });
        });

        app.MapPost("/auth/register", [AllowAnonymous]
            async (RegistrationRequest register, UserManager<AppUser> userManager) =>
            {
                // This endpoint only allows for primary account holder registration
                // and then blocks subsequent requests. This is so that anonymous
                // users can't register an account, and they can only be created by
                // authorized users.
                var exists = await userManager.Users.FirstOrDefaultAsync();
                if (exists != null) return Results.Forbid();

                // Check if user already exists. You should not do this if your app is publicly available,
                // and instead verify email addresses, and simply respond with "ok" so people can't fish for emails.
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
            async (UserManager<AppUser> userManager, HttpContext context, LoginRequest login) =>
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

                return Results.Ok();
            });
    }
}