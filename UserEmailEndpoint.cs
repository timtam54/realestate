using buyselwebapi.data;
using Microsoft.EntityFrameworkCore;

namespace buyselwebapi.endpoint
{
    public static class UserEmailEndpoint
    {
        public static void MapUserEmailEndpoint(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/user").WithTags("UserEmail");

            // GET: /api/user/email/{email} - Get user by email
            // This is needed by the chat frontend to convert email to user ID
            group.MapGet("/email/{email}", async (string email, dbcontext db) =>
            {
                var user = await db.user
                    .Where(u => u.email == email)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return Results.NotFound(new { error = "User not found" });
                }

                // Return same format as your existing /api/user/{id} endpoint
                return Results.Ok(user);
            })
            .WithName("GetUserByEmail")
            .WithOpenApi();
        }
    }
}
