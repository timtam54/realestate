# Custom JWT Authentication Implementation

This application uses a custom JWT authentication system with OAuth 2.0 social providers (Google, Microsoft, Facebook). This is the same architecture as Auth0, Clerk, and Firebase Auth - we've built our own auth service instead of paying for theirs.

## Architecture Overview

The system consists of three main components:

1. **OAuth Flows** - Handled by Next.js route handlers (`/api/auth/{provider}`)
2. **Session Management** - Using `iron-session` for encrypted session cookies
3. **JWT Generation** - Self-issued JWTs signed with HS256 for the C# backend API

## Environment Variables

Add these to your `.env.local` file:

```bash
# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters

# JWT Secret for C# backend (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-for-csharp-backend

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft Azure AD OAuth
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Base URL (for OAuth redirects)
NEXTAUTH_URL=http://localhost:3000  # or your production URL

# C# Backend API URL
NEXT_PUBLIC_API_URL=https://buysel.azurewebsites.net
```

## How Authentication Works

### 1. User Sign-In Flow

```
User clicks "Sign in with Google"
  ↓
Frontend: Redirects to /api/auth/google
  ↓
OAuth: User authenticates with Google
  ↓
OAuth: Redirects back to /api/auth/google/callback with code
  ↓
Backend: Exchanges code for access token
  ↓
Backend: Fetches user info from Google
  ↓
Backend: Creates/updates user in C# database via POST /api/users/oauth
  ↓
Backend: Creates iron-session with user data
  ↓
User is redirected to original page (authenticated)
```

### 2. API Calls to C# Backend

```
Frontend needs to call C# API
  ↓
Frontend: Calls GET /api/auth/token
  ↓
Backend: Reads iron-session
  ↓
Backend: Generates JWT with user info
  ↓
Backend: Returns JWT to frontend
  ↓
Frontend: Includes JWT in Authorization header
  ↓
C# Backend: Validates JWT and processes request
```

## Frontend Usage

### Using the Auth Hook

```typescript
import { useAuth } from '@/lib/auth/auth-context'

function MyComponent() {
  const { user, isAuthenticated, isLoading, signIn, signOut, getToken } = useAuth()

  // Sign in with a provider
  const handleSignIn = () => {
    signIn('google', '/dashboard') // provider, callbackUrl
  }

  // Sign out
  const handleSignOut = async () => {
    await signOut()
  }

  // Get JWT for API calls
  const callAPI = async () => {
    const token = await getToken()
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>

  return <div>Welcome, {user.name}!</div>
}
```

### Session Data Structure

```typescript
interface SessionData {
  user?: {
    id: string
    email: string
    name: string
    image?: string
    provider: 'google' | 'microsoft' | 'facebook'
    role?: string
  }
  isLoggedIn: boolean
}
```

### JWT Payload Structure

```typescript
interface JWTPayload {
  sub: string       // user id
  email: string
  name: string
  role?: string
  provider: string
  iss: string       // issuer: "buysel-app"
  aud: string       // audience: "buysel-api"
  iat: number       // issued at
  exp: number       // expires at (1 hour from iat)
}
```

## C# Backend Requirements

### 1. User OAuth Endpoint

The C# backend must implement a `POST /api/users/oauth` endpoint that:

- Accepts user data from OAuth providers
- Creates a new user if they don't exist
- Updates existing user if they do exist
- Returns the complete user object including database ID and role

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "provider": "google",
  "providerId": "oauth-provider-user-id"
}
```

**Response:**
```json
{
  "id": "user-database-id",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "role": "user",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### 2. JWT Validation Configuration

Add JWT authentication to your C# backend using `Microsoft.AspNetCore.Authentication.JwtBearer`:

```csharp
// Program.cs or Startup.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "buysel-app",
            ValidAudience = "buysel-api",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT_SECRET"])
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
```

**Don't forget to add the middleware:**
```csharp
app.UseAuthentication();
app.UseAuthorization();
```

**Add JWT_SECRET to your environment variables:**
```bash
JWT_SECRET=same-secret-as-nextjs-app
```

### 3. Protect API Endpoints

```csharp
[Authorize]
[HttpGet("protected")]
public IActionResult GetProtectedData()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var email = User.FindFirst(ClaimTypes.Email)?.Value;

    // Your logic here
    return Ok(new { userId, email });
}
```

## API Routes

### Authentication Routes

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth
- `GET /api/auth/microsoft/callback` - Microsoft OAuth callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `GET /api/auth/session` - Get current session
- `GET /api/auth/token` - Get JWT for API calls
- `POST /api/auth/signout` - Sign out user

## Security Considerations

1. **Session Cookies**: Encrypted with iron-session using SESSION_SECRET
2. **JWT Tokens**: Signed with HS256 using JWT_SECRET, expire after 1 hour
3. **OAuth State**: Protected against CSRF using callback URL validation
4. **HTTPS Only**: Session cookies are secure in production
5. **httpOnly Cookies**: Session cookies cannot be accessed by JavaScript
6. **SameSite**: Set to 'lax' for CSRF protection

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `{NEXTAUTH_URL}/api/auth/google/callback`

### Microsoft Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory
3. Register a new application
4. Add redirect URI: `{NEXTAUTH_URL}/api/auth/microsoft/callback`
5. Create a client secret
6. Note the Application (client) ID and Directory (tenant) ID

### Facebook

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add valid OAuth redirect URI: `{NEXTAUTH_URL}/api/auth/facebook/callback`
5. Copy App ID and App Secret

## Migration from NextAuth

This implementation replaces NextAuth.js. Key differences:

| Feature | NextAuth | Custom Implementation |
|---------|----------|----------------------|
| Session Storage | JWT or Database | iron-session (encrypted cookie) |
| OAuth Handling | Built-in | Manual implementation |
| API Protection | getServerSession | Custom middleware/JWT |
| Customization | Limited | Full control |
| Cost | Free (OSS) | Free (self-hosted) |
| Complexity | Low | Medium |

## Troubleshooting

### "Unauthorized" errors
- Check that SESSION_SECRET and JWT_SECRET are set
- Verify JWT_SECRET matches between Next.js and C# backend
- Ensure session cookie is being sent with requests

### OAuth redirect errors
- Verify NEXTAUTH_URL is correct
- Check redirect URIs in OAuth provider settings
- Ensure callback URLs match exactly

### Token expiration
- JWTs expire after 1 hour
- Frontend should handle token refresh by calling `/api/auth/token` again
- Consider implementing automatic token refresh

## Future Enhancements

- [ ] Add refresh token support
- [ ] Implement rate limiting
- [ ] Add email/password authentication
- [ ] Add 2FA support
- [ ] Add session management (view/revoke active sessions)
- [ ] Add audit logging for authentication events
