# C# Backend JWT Authentication Usage Guide

This guide shows how to use the JWT authentication in your C# endpoints.

## Program.cs Configuration

The `Program.cs` file is already configured with:

1. **JWT Authentication** using `Microsoft.AspNetCore.Authentication.JwtBearer`
2. **CORS** configured to allow requests from your Next.js frontend
3. **Authorization** middleware enabled

## Required NuGet Packages

Make sure these packages are installed:

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.IdentityModel.Tokens
dotnet add package System.IdentityModel.Tokens.Jwt
```

## How to Protect Endpoints

### Option 1: Require Authentication (Basic)

```csharp
// Requires any authenticated user
group.MapGet("/protected", async (ClaimsPrincipal user, dbcontext db) =>
{
    if (!user.IsAuthenticated())
    {
        return Results.Unauthorized();
    }

    var userId = user.GetUserId();
    var userEmail = user.GetUserEmail();

    // Your logic here
    return Results.Ok(new { userId, userEmail });
})
.RequireAuthorization(); // This enforces JWT authentication
```

### Option 2: Get User Info from JWT

```csharp
group.MapGet("/my-properties", async (ClaimsPrincipal user, dbcontext db) =>
{
    // Check if user is authenticated
    if (!user.IsAuthenticated())
    {
        return Results.Unauthorized();
    }

    // Get user information from JWT claims
    var userId = user.GetUserId();
    var userEmail = user.GetUserEmail();
    var userName = user.GetUserName();
    var userRole = user.GetUserRole();

    // Use the user info in your query
    var properties = await db.properties
        .Where(p => p.sellerid.ToString() == userId)
        .ToListAsync();

    return Results.Ok(properties);
})
.RequireAuthorization();
```

### Option 3: Optional Authentication

```csharp
// Some endpoints might allow both authenticated and anonymous access
group.MapGet("/properties", async (ClaimsPrincipal? user, dbcontext db) =>
{
    var properties = await db.properties.ToListAsync();

    // If user is authenticated, you could customize the response
    if (user?.IsAuthenticated() == true)
    {
        var userId = user.GetUserId();
        // Maybe add favorite status or ownership info
    }

    return Results.Ok(properties);
});
// Note: No .RequireAuthorization() - this is optional auth
```

## Example: Update UserEndpoints with Authentication

Here's how you could protect the user endpoints:

```csharp
public static void MapUserEndpoints(this IEndpointRouteBuilder routes)
{
    var group = routes.MapGroup("/api/user").WithTags(nameof(UserEndpoints));

    // Public endpoint - OAuth user creation (no auth required)
    routes.MapPost("/api/users/oauth", async (OAuthUserRequest request, dbcontext db) =>
    {
        // ... existing code ...
    })
    .WithName("CreateOrUpdateOAuthUser")
    .WithTags("Authentication");

    // Protected endpoint - Get current user profile
    group.MapGet("/me", async (ClaimsPrincipal user, dbcontext db) =>
    {
        if (!user.IsAuthenticated())
        {
            return Results.Unauthorized();
        }

        var userEmail = user.GetUserEmail();
        var userProfile = await db.users
            .Where(u => u.email == userEmail)
            .FirstOrDefaultAsync();

        if (userProfile == null)
        {
            return Results.NotFound(new { error = "User not found" });
        }

        return Results.Ok(userProfile);
    })
    .RequireAuthorization();

    // Protected endpoint - Update user profile
    group.MapPut("/me", async (ClaimsPrincipal user, user updatedUser, dbcontext db) =>
    {
        if (!user.IsAuthenticated())
        {
            return Results.Unauthorized();
        }

        var userEmail = user.GetUserEmail();
        var existingUser = await db.users
            .Where(u => u.email == userEmail)
            .FirstOrDefaultAsync();

        if (existingUser == null)
        {
            return Results.NotFound(new { error = "User not found" });
        }

        // Update only allowed fields
        existingUser.firstname = updatedUser.firstname;
        existingUser.lastname = updatedUser.lastname;
        existingUser.mobile = updatedUser.mobile;
        // ... update other fields ...

        await db.SaveChangesAsync();

        return Results.Ok(existingUser);
    })
    .RequireAuthorization();

    // Public endpoint - Get user by ID (anyone can view)
    group.MapGet("/{userId}", async (int userId, dbcontext db) =>
    {
        // ... existing code ...
    });
}
```

## Example: Protect Property Endpoints

```csharp
public static void MapPropertyEndpoints(this IEndpointRouteBuilder routes)
{
    var group = routes.MapGroup("/api/property").WithTags(nameof(PropertyEndpoints));

    // Public - Anyone can view properties
    group.MapGet("", async (dbcontext db) =>
    {
        var properties = await db.properties.ToListAsync();
        return Results.Ok(properties);
    });

    // Public - Anyone can view a specific property
    group.MapGet("/{propertyId}", async (int propertyId, dbcontext db) =>
    {
        var property = await db.properties.FindAsync(propertyId);
        return property != null ? Results.Ok(property) : Results.NotFound();
    });

    // Protected - Only authenticated users can create properties
    group.MapPost("", async (ClaimsPrincipal user, property newProperty, dbcontext db) =>
    {
        if (!user.IsAuthenticated())
        {
            return Results.Unauthorized();
        }

        var userId = user.GetUserId();

        // Set the seller ID from the authenticated user
        newProperty.sellerid = int.Parse(userId);
        newProperty.dte = DateTime.UtcNow;

        db.properties.Add(newProperty);
        await db.SaveChangesAsync();

        return Results.Created($"/api/property/{newProperty.id}", newProperty);
    })
    .RequireAuthorization();

    // Protected - Only property owner can update
    group.MapPut("/{propertyId}", async (
        ClaimsPrincipal user,
        int propertyId,
        property updatedProperty,
        dbcontext db) =>
    {
        if (!user.IsAuthenticated())
        {
            return Results.Unauthorized();
        }

        var userId = user.GetUserId();
        var existingProperty = await db.properties.FindAsync(propertyId);

        if (existingProperty == null)
        {
            return Results.NotFound();
        }

        // Check if user owns this property
        if (existingProperty.sellerid.ToString() != userId)
        {
            return Results.Forbid();
        }

        // Update property
        existingProperty.title = updatedProperty.title;
        existingProperty.price = updatedProperty.price;
        // ... update other fields ...

        await db.SaveChangesAsync();

        return Results.Ok(existingProperty);
    })
    .RequireAuthorization();

    // Protected - Only property owner can delete
    group.MapDelete("/{propertyId}", async (
        ClaimsPrincipal user,
        int propertyId,
        dbcontext db) =>
    {
        if (!user.IsAuthenticated())
        {
            return Results.Unauthorized();
        }

        var userId = user.GetUserId();
        var property = await db.properties.FindAsync(propertyId);

        if (property == null)
        {
            return Results.NotFound();
        }

        if (property.sellerid.ToString() != userId)
        {
            return Results.Forbid();
        }

        db.properties.Remove(property);
        await db.SaveChangesAsync();

        return Results.NoContent();
    })
    .RequireAuthorization();
}
```

## Testing Protected Endpoints

### Using Postman or curl

1. **Get a JWT token from your Next.js app:**
   - Sign in to your app
   - Open browser DevTools → Console
   - Run: `fetch('/api/auth/token').then(r => r.json()).then(d => console.log(d.token))`
   - Copy the token

2. **Use the token in API requests:**

```bash
# curl example
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     https://buysel.azurewebsites.net/api/user/me

# Or in Postman:
# Add header: Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## JWT Token Structure

When a user signs in via your Next.js app, the backend generates a JWT with these claims:

```json
{
  "sub": "user-id",           // User ID
  "email": "user@example.com", // User email
  "name": "John Doe",         // User name
  "role": "user",             // User role
  "provider": "google",       // OAuth provider
  "iss": "buysel-app",        // Issuer
  "aud": "buysel-api",        // Audience
  "iat": 1234567890,          // Issued at
  "exp": 1234571490           // Expires at (1 hour later)
}
```

## Common Patterns

### Pattern 1: User must own a resource

```csharp
var userId = user.GetUserId();
var resource = await db.resources.FindAsync(resourceId);

if (resource.ownerId.ToString() != userId)
{
    return Results.Forbid(); // 403 Forbidden
}
```

### Pattern 2: Admin-only endpoint

```csharp
var userRole = user.GetUserRole();

if (userRole != "admin")
{
    return Results.Forbid();
}
```

### Pattern 3: Soft authentication (optional)

```csharp
var userId = user?.GetUserId();
var isAuthenticated = user?.IsAuthenticated() ?? false;

// Customize response based on auth status
if (isAuthenticated)
{
    // Include private data
}
```

## Environment Variables

Make sure to set these in your C# app configuration:

### appsettings.json
```json
{
  "JWT_SECRET": "your-jwt-secret-must-match-nextjs",
  "Frontend": {
    "Url": "http://localhost:3000"
  },
  "ConnectionStrings": {
    "DefaultConnection": "your-connection-string"
  }
}
```

### Azure App Service
Set these environment variables:
- `JWT_SECRET` - Must match the `JWT_SECRET` in your Next.js app

## Error Responses

The JWT middleware will return these status codes:

- **401 Unauthorized**: No token provided or token is invalid
- **403 Forbidden**: Token is valid but user doesn't have permission
- **Token expired**: The token is older than 1 hour

## Security Best Practices

1. **Always validate user ownership**: Don't trust the userId in the request body, use `user.GetUserId()` from the JWT
2. **Use HTTPS in production**: Never send JWTs over HTTP
3. **Keep JWT_SECRET secret**: Store it in environment variables, never in code
4. **Set short expiration times**: Tokens expire after 1 hour by default
5. **Validate on every request**: The middleware handles this automatically
6. **Log authentication failures**: Already configured in Program.cs

## Troubleshooting

### "No authenticationScheme was specified"
- Make sure `app.UseAuthentication()` comes before `app.UseAuthorization()`
- Add `.RequireAuthorization()` to endpoints that need protection

### "401 Unauthorized" on valid requests
- Check that JWT_SECRET matches between Next.js and C# exactly
- Verify the token hasn't expired (check `exp` claim)
- Make sure Authorization header is formatted: `Bearer <token>`

### "The issuer is invalid"
- Issuer must be exactly "buysel-app" in both systems
- Audience must be exactly "buysel-api" in both systems
