using System.Security.Claims;

namespace IncidentWebAPI.endpoint
{
    public static class JwtExtensions
    {
        /// <summary>
        /// Gets the user ID from the JWT claims
        /// </summary>
        public static string? GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? user.FindFirst("sub")?.Value;
        }

        /// <summary>
        /// Gets the user email from the JWT claims
        /// </summary>
        public static string? GetUserEmail(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Email)?.Value
                   ?? user.FindFirst("email")?.Value;
        }

        /// <summary>
        /// Gets the user name from the JWT claims
        /// </summary>
        public static string? GetUserName(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Name)?.Value
                   ?? user.FindFirst("name")?.Value;
        }

        /// <summary>
        /// Gets the user role from the JWT claims
        /// </summary>
        public static string? GetUserRole(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value
                   ?? user.FindFirst("role")?.Value;
        }

        /// <summary>
        /// Checks if the user is authenticated
        /// </summary>
        public static bool IsAuthenticated(this ClaimsPrincipal user)
        {
            return user.Identity?.IsAuthenticated ?? false;
        }
    }
}
