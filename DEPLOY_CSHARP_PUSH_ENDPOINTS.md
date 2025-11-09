# Deploy C# Push Notification Endpoints

## Overview
Your Next.js frontend is now ready for push notifications, but needs the C# backend endpoints to be deployed.

## 📋 What You Need to Deploy

The `BACKEND_UPDATES.cs` file contains the push notification endpoints that your frontend is calling.

### Required Endpoints:
1. `POST /api/push/push_subscription` - Save web push subscription
2. `GET /api/push/push_subscription/email/{email}` - Get subscriptions by email
3. `DELETE /api/push/push_subscription/{id}` - Delete expired subscription

## 🚀 Deployment Steps

### Step 1: Locate Your C# Web API Project

You mentioned you already have conversation and message endpoints deployed. Find where that code is:

```bash
# Your C# Web API project should be in a location like:
# - /Users/timhams/Documents/buyselwebapi
# - A separate git repository
# - Azure DevOps repo
```

**Do you have your C# Web API project locally?**

### Step 2: Update Your Existing Push Subscription Endpoint File

You already have push endpoints (from your earlier `BACKEND_UPDATES.cs`). You need to **replace** the `MapPushSubscrptionEndpoints` method with the updated version.

**Find this file in your C# project:**
- It's in a file that contains `MapPushSubscrptionEndpoints`
- Likely named something like `PushSubscriptionEndpoints.cs` or `pushsubscriptionEP.cs`

### Step 3: Replace the Method

**Original method (what you currently have):**
```csharp
public static void MapPushSubscrptionEndpoints(this IEndpointRouteBuilder routes)
{
    var group = routes.MapGroup("/api/push").WithTags(nameof(pushsubscriptionEP));

    // Old endpoints like /api/push/subscribe
    // ...
}
```

**Replace with (from BACKEND_UPDATES.cs):**
```csharp
public static void MapPushSubscrptionEndpoints(this IEndpointRouteBuilder routes)
{
    var group = routes.MapGroup("/api/push").WithTags(nameof(pushsubscriptionEP));

    // NEW: Web push subscription endpoint
    group.MapPost("/push_subscription", async (HttpContext context, dbcontext db) =>
    {
        var body = await context.Request.ReadFromJsonAsync<WebPushSubscriptionRequest>();
        // ... (full code from BACKEND_UPDATES.cs)
    });

    // NEW: Get subscriptions by email
    group.MapGet("/push_subscription/email/{email}", async (string email, dbcontext db) =>
    {
        // ... (full code from BACKEND_UPDATES.cs)
    });

    // NEW: Delete subscription
    group.MapDelete("/push_subscription/{id}", async (int id, dbcontext db) =>
    {
        // ... (full code from BACKEND_UPDATES.cs)
    });

    // Keep your existing /api/push/subscribe endpoints for backwards compatibility
}
```

### Step 4: Ensure DTOs Are Defined

Add these record types at the bottom of the file (if not already there):

```csharp
public record WebPushSubscriptionRequest(
    string email,
    SubscriptionData subscription_data,
    string? platform
);

public record SubscriptionData(
    string endpoint,
    SubscriptionKeys? keys
);

public record SubscriptionKeys(
    string p256dh,
    string auth
);
```

### Step 5: Verify Program.cs Registration

Make sure your `Program.cs` has:

```csharp
app.MapPushSubscrptionEndpoints(); // Should already be there
```

### Step 6: Test Locally (Optional)

If you can run your C# API locally:

```bash
dotnet run
# Test: https://localhost:5001/api/push/push_subscription
```

### Step 7: Deploy to Azure

**Option A: Manual Deployment (Visual Studio)**
1. Right-click project → Publish
2. Select your Azure App Service (buysel.azurewebsites.net)
3. Click Publish

**Option B: Git Push (if set up)**
```bash
git add .
git commit -m "Add push notification endpoints"
git push azure main
```

**Option C: Azure DevOps Pipeline**
- Commit and push to your repo
- Pipeline will auto-deploy

## ✅ Verification After Deployment

### Test the Endpoints

1. **Save Subscription:**
```bash
curl -X POST https://buysel.azurewebsites.net/api/push/push_subscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subscription_data": {
      "endpoint": "https://fcm.googleapis.com/test",
      "keys": {
        "p256dh": "test-key",
        "auth": "test-auth"
      }
    },
    "platform": "web"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Subscription saved"
}
```

2. **Get Subscriptions:**
```bash
curl https://buysel.azurewebsites.net/api/push/push_subscription/email/test@example.com
```

Expected response:
```json
{
  "subscriptions": [
    {
      "id": 1,
      "email": "test@example.com",
      "subscription_data": {
        "endpoint": "https://fcm.googleapis.com/test",
        "keys": {
          "p256dh": "test-key",
          "auth": "test-auth"
        }
      }
    }
  ]
}
```

### Test from Your Next.js App

1. Open https://buysel.azurewebsites.net
2. Open browser console (F12)
3. Look for:
```
✅ [API] Subscription saved successfully
```

Instead of:
```
❌ [API] Failed to save subscription to backend: 404
```

## 🔧 Troubleshooting

### 404 Error
- Endpoint not deployed
- Check route: Must be `/api/push/push_subscription` (not `/api/push_subscription`)

### 500 Error
- Check database has `pushsubscriptions` table
- Verify DTOs are defined

### CORS Error
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://agreeable-sky-08a3a0e00.4.azurestaticapps.net")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowFrontend");
```

## 📝 Quick Reference

**Files to Update:**
- Your existing push subscription endpoint file (add new endpoints)

**New Endpoints:**
- `POST /api/push/push_subscription`
- `GET /api/push/push_subscription/email/{email}`
- `DELETE /api/push/push_subscription/{id}`

**What Happens After Deployment:**
✅ Users can subscribe to push notifications
✅ Chat messages trigger browser notifications
✅ Notifications work even when tab is closed
✅ No more 404 errors in console

---

## 🤔 Need Help?

**Where is your C# Web API project located?**
Let me know and I can provide more specific deployment instructions!
