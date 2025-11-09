using buyselwebapi.data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace IncidentWebAPI.endpoint
{
    // DTO for OAuth user creation/update
    public class OAuthUserRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Picture { get; set; }

        [Required]
        public string Provider { get; set; } = string.Empty; // "google", "microsoft", "facebook"

        [Required]
        public string ProviderId { get; set; } = string.Empty;
    }

    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/user").WithTags(nameof(UserEndpoints));

            // POST: /api/users/oauth - Create or update user from OAuth provider
            routes.MapPost("/api/users/oauth", async (OAuthUserRequest request, dbcontext db) =>
            {
                try
                {
                    // Validate request
                    if (string.IsNullOrWhiteSpace(request.Email) ||
                        string.IsNullOrWhiteSpace(request.Name) ||
                        string.IsNullOrWhiteSpace(request.Provider) ||
                        string.IsNullOrWhiteSpace(request.ProviderId))
                    {
                        return Results.BadRequest(new { error = "Email, Name, Provider, and ProviderId are required" });
                    }

                    // Check if user already exists
                    var existingUser = await db.users
                        .FirstOrDefaultAsync(u => u.email == request.Email);

                    if (existingUser != null)
                    {
                        // Update existing user
                        existingUser.firstname = request.Name.Split(' ').FirstOrDefault() ?? request.Name;
                        existingUser.lastname = request.Name.Split(' ').Skip(1).FirstOrDefault() ?? "";

                        // Only set photo from OAuth if user doesn't already have one (don't overwrite uploaded photos)
                        if (!string.IsNullOrEmpty(request.Picture) && string.IsNullOrEmpty(existingUser.photoazurebloburl))
                        {
                            existingUser.photoazurebloburl = request.Picture;
                        }

                        await db.SaveChangesAsync();

                        return Results.Ok(new
                        {
                            id = existingUser.id.ToString(),
                            email = existingUser.email,
                            name = $"{existingUser.firstname} {existingUser.lastname}".Trim(),
                            picture = existingUser.photoazurebloburl,
                            role = "user", // You can implement role logic here
                            createdAt = existingUser.dte
                        });
                    }
                    else
                    {
                        // Create new user
                        var nameParts = request.Name.Split(' ', 2);
                        var newUser = new user
                        {
                            email = request.Email,
                            firstname = nameParts.FirstOrDefault() ?? request.Name,
                            lastname = nameParts.Length > 1 ? nameParts[1] : "",
                            photoazurebloburl = request.Picture ?? "",
                            mobile = "", // Will be filled in profile completion
                            address = "",
                            residencystatus = "",
                            maritalstatus = null,
                            powerofattorney = "",
                            termsconditions = false,
                            privacypolicy = false,
                            idtype = "none",
                            idbloburl = "",
                            idverified = null,
                            ratesnotice = null,
                            titlesearch = null,
                            ratesnoticeverified = null,
                            titlesearchverified = null,
                            photoverified = null,
                            dte = DateTime.UtcNow
                        };

                        db.users.Add(newUser);
                        await db.SaveChangesAsync();

                        return Results.Ok(new
                        {
                            id = newUser.id.ToString(),
                            email = newUser.email,
                            name = $"{newUser.firstname} {newUser.lastname}".Trim(),
                            picture = newUser.photoazurebloburl,
                            role = "user",
                            createdAt = newUser.dte
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in OAuth user creation: {ex.Message}");
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error creating/updating user"
                    );
                }
            })
            .WithName("CreateOrUpdateOAuthUser")
            .WithTags("Authentication");

            // GET: /api/user/{userId} - Get user by ID
            group.MapGet("/{userId}", async (int userId, dbcontext db) =>
            {
                var user = await db.users
                    .Where(u => u.id == userId)
                    .Select(u => new
                    {
                        id = u.id,
                        email = u.email,
                        firstname = u.firstname,
                        lastname = u.lastname,
                        photoazurebloburl = u.photoazurebloburl,
                        phonenumber = u.mobile,
                        createdat = u.dte,
                        updatedat = (DateTime?)null  // Will be added to database later
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return Results.NotFound(new { error = "User not found" });
                }

                return Results.Ok(user);
            });

            // GET: /api/user/email/{email} - Get user by email
            group.MapGet("/email/{email}", async (string email, dbcontext db) =>
            {
                var user = await db.users
                    .Where(u => u.email == email)
                    .Select(u => new
                    {
                        id = u.id,
                        email = u.email,
                        firstname = u.firstname,
                        lastname = u.lastname,
                        photoazurebloburl = u.photoazurebloburl,
                        phonenumber = u.mobile,
                        createdat = u.dte,
                        updatedat = (DateTime?)null  // Will be added to database later
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return Results.NotFound(new { error = "User not found" });
                }

                return Results.Ok(user);
            });
        }
    }
}
