# Custom JWT Authentication - Deployment Guide

This guide walks you through deploying the custom JWT authentication system for both your Next.js frontend and C# backend.

## Overview

You've replaced NextAuth with a custom JWT authentication system that uses:
- **OAuth 2.0** for social login (Google, Microsoft, Facebook)
- **iron-session** for encrypted session cookies (Next.js)
- **Self-issued JWTs** for API authentication (C# backend)

## Critical: JWT_SECRET Configuration

**THE MOST IMPORTANT THING**: The `JWT_SECRET` must be **identical** in both your Next.js app and C# backend.

### Generate a Strong Secret

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Example output: `xK8vN2mP4rQ6sT8uV0wX1yZ3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9`

**Use this EXACT same value in both applications!**

## Next.js Frontend Deployment

### 1. Update .env.local (Local Development)

```bash
# Session Secret (for iron-session cookie encryption)
SESSION_SECRET=your-session-secret-at-least-32-characters

# JWT Secret for C# backend - MUST MATCH C# BACKEND!
JWT_SECRET=xK8vN2mP4rQ6sT8uV0wX1yZ3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop

# Microsoft Azure AD OAuth
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Base URL (for OAuth redirects)
NEXTAUTH_URL=http://localhost:3000

# C# Backend API URL
NEXT_PUBLIC_API_URL=https://buysel.azurewebsites.net
```

### 2. Azure Static Web Apps Configuration

In Azure Portal → Your Static Web App → Configuration → Application settings:

Add these environment variables:

| Name | Value |
|------|-------|
| `SESSION_SECRET` | (your session secret) |
| `JWT_SECRET` | (SAME as C# backend!) |
| `GOOGLE_CLIENT_ID` | (your Google client ID) |
| `GOOGLE_CLIENT_SECRET` | (your Google client secret) |
| `AZURE_AD_CLIENT_ID` | (your Azure AD client ID) |
| `AZURE_AD_CLIENT_SECRET` | (your Azure AD client secret) |
| `AZURE_AD_TENANT_ID` | (your Azure AD tenant ID) |
| `FACEBOOK_CLIENT_ID` | (your Facebook app ID) |
| `FACEBOOK_CLIENT_SECRET` | (your Facebook app secret) |
| `NEXTAUTH_URL` | `https://agreeable-sky-08a3a0e00.5.azurestaticapps.net` |
| `NEXT_PUBLIC_API_URL` | `https://buysel.azurewebsites.net` |

### 3. Update OAuth Provider Redirect URIs

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://agreeable-sky-08a3a0e00.5.azurestaticapps.net/api/auth/google/callback
   ```

#### Microsoft Azure AD
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Select your app
4. Go to Authentication → Add a platform → Web
5. Add redirect URI:
   ```
   https://agreeable-sky-08a3a0e00.5.azurestaticapps.net/api/auth/microsoft/callback
   ```

#### Facebook Developers
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to Products → Facebook Login → Settings
4. Add Valid OAuth Redirect URI:
   ```
   https://agreeable-sky-08a3a0e00.5.azurestaticapps.net/api/auth/facebook/callback
   ```

## C# Backend Deployment

### 1. Azure App Service Configuration

In Azure Portal → Your App Service → Configuration → Application settings:

Add these environment variables:

| Name | Value | Note |
|------|-------|------|
| `JWT_SECRET` | (SAME as Next.js!) | **CRITICAL: Must match!** |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Sets environment |

### 2. Verify appsettings.json

Your `appsettings.json` should NOT contain the actual JWT_SECRET (for security):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "JWT_SECRET": "IMPORTANT-REPLACE-THIS-WITH-SAME-SECRET-AS-NEXTJS-ENV"
}
```

The actual secret will come from Azure App Service environment variables.

### 3. Verify Program.cs

Your `Program.cs` is already configured to:
- ✅ Read `JWT_SECRET` from configuration
- ✅ Validate issuer: `"buysel-app"`
- ✅ Validate audience: `"buysel-api"`
- ✅ Enable CORS for Next.js frontend
- ✅ Use proper middleware order

### 4. Deploy to Azure

```bash
# Build the project
dotnet build --configuration Release

# Publish
dotnet publish --configuration Release --output ./publish

# Deploy to Azure (using Azure CLI)
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name buysel \
  --src ./publish.zip
```

## Verification Steps

### 1. Test JWT Secret Matching

Create a test file `test-jwt.js`:

```javascript
const crypto = require('crypto');

const secret1 = "your-nextjs-JWT_SECRET";
const secret2 = "your-csharp-JWT_SECRET";

console.log("Next.js JWT_SECRET:", secret1);
console.log("C# JWT_SECRET:     ", secret2);
console.log("Match:", secret1 === secret2 ? "✅ YES" : "❌ NO - FIX THIS!");
```

Run: `node test-jwt.js`

### 2. Test Authentication Flow

1. **Sign in to your Next.js app**
   - Go to https://agreeable-sky-08a3a0e00.5.azurestaticapps.net
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify you're redirected back and signed in

2. **Get a JWT token**
   - Open browser DevTools → Console
   - Run:
     ```javascript
     fetch('/api/auth/token')
       .then(r => r.json())
       .then(d => {
         console.log('JWT Token:', d.token);
         localStorage.setItem('test_token', d.token);
       });
     ```

3. **Test C# API with token**
   - In DevTools Console:
     ```javascript
     const token = localStorage.getItem('test_token');
     fetch('https://buysel.azurewebsites.net/api/user/me', {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     })
     .then(r => r.json())
     .then(d => console.log('User data:', d));
     ```

   - If successful, you'll see your user data
   - If 401 Unauthorized, check JWT_SECRET mismatch

### 3. Check C# Backend Logs

In Azure Portal → Your App Service → Log stream:

Look for these messages:
- ✅ `🔐 JWT Authentication configured`
- ✅ `📨 JWT Token received`
- ✅ `✅ JWT Token validated - User: ...`

If you see errors:
- ❌ `🔑 Invalid token signature` → JWT_SECRET mismatch
- ❌ `🏢 Invalid issuer` → Check issuer in Next.js JWT generation
- ❌ `👥 Invalid audience` → Check audience in Next.js JWT generation
- ❌ `⏰ Token has expired` → Token older than 1 hour

## Common Issues & Solutions

### Issue: 401 Unauthorized on all API calls

**Cause**: JWT_SECRET doesn't match between Next.js and C#

**Solution**:
1. Verify both secrets are identical:
   ```bash
   # On your local machine
   echo $JWT_SECRET  # From .env.local

   # In Azure App Service
   az webapp config appsettings list \
     --name buysel \
     --resource-group your-rg \
     --query "[?name=='JWT_SECRET'].value" -o tsv
   ```

2. Make sure they match EXACTLY (no extra spaces, newlines, etc.)

### Issue: "Invalid issuer" or "Invalid audience"

**Cause**: Issuer/audience values don't match

**Solution**: Verify these match in both systems:
- Next.js `lib/auth/jwt.ts`:
  - `.setIssuer('buysel-app')`
  - `.setAudience('buysel-api')`
- C# `Program.cs`:
  - `ValidIssuer = "buysel-app"`
  - `ValidAudience = "buysel-api"`

### Issue: CORS errors

**Cause**: Frontend URL not in CORS allowlist

**Solution**: Update Program.cs CORS policy:
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://agreeable-sky-08a3a0e00.5.azurestaticapps.net",  // Your actual URL
    "https://buyselapp.icymeadow-c7b88605.australiaeast.azurecontainerapps.io"
)
```

### Issue: OAuth callback fails

**Cause**: Redirect URI not configured in OAuth provider

**Solution**: Add callback URLs to each provider:
- Google: `{YOUR_URL}/api/auth/google/callback`
- Microsoft: `{YOUR_URL}/api/auth/microsoft/callback`
- Facebook: `{YOUR_URL}/api/auth/facebook/callback`

### Issue: "No user found" after OAuth

**Cause**: C# `/api/users/oauth` endpoint not working

**Solution**:
1. Check UserEndpoints.cs is mapped in Program.cs
2. Verify database connection
3. Check logs for errors during user creation

## Security Checklist

Before going to production:

- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET is different in production vs development
- [ ] JWT_SECRET is stored in environment variables (not in code)
- [ ] SESSION_SECRET is different from JWT_SECRET
- [ ] OAuth client secrets are in environment variables
- [ ] HTTPS is enabled on both frontend and backend
- [ ] CORS is configured to only allow your domains
- [ ] Database connection string doesn't contain passwords in code
- [ ] JWT tokens expire (currently 1 hour - appropriate for your use case)
- [ ] Session cookies are httpOnly and secure in production

## Monitoring & Logging

### Next.js Logs (Azure Static Web Apps)

View in: Azure Portal → Static Web App → Functions → Monitor

Look for:
- OAuth callback successes/failures
- JWT generation requests
- Session creation

### C# Backend Logs (Azure App Service)

View in: Azure Portal → App Service → Log stream

The Program.cs includes detailed logging:
- `📨` Token received
- `✅` Token validated successfully
- `❌` Authentication failed
- `🔑` Invalid signature (JWT_SECRET mismatch)
- `⏰` Token expired

## Rollback Plan

If you need to rollback to the old system:

1. **Frontend**:
   ```bash
   git revert <commit-hash>
   npm install next-auth@^4.24.11
   ```

2. **Backend**:
   - Restore old Program.cs
   - Change `JWT_SECRET` back to `NextAuth:Secret`
   - Redeploy

## Support

If you encounter issues:

1. Check the logs (both Next.js and C#)
2. Verify JWT_SECRET matches exactly
3. Test locally first before deploying to production
4. Use browser DevTools → Network tab to see actual requests/responses

## Next Steps

After successful deployment:

1. **Test all OAuth providers** (Google, Microsoft, Facebook)
2. **Test protected endpoints** in your app
3. **Monitor logs** for first 24 hours
4. **Set up alerts** in Azure for authentication failures
5. **Document** any custom configurations for your team

## Reference Files

- Next.js Auth Implementation: `AUTH_IMPLEMENTATION.md`
- C# JWT Usage Guide: `CSHARP_JWT_USAGE.md`
- Next.js Auth Context: `lib/auth/auth-context.tsx`
- C# Program.cs: `Program.cs`
- C# User Endpoints: `UserEndpoints.cs`
