# Chat System Setup Instructions

## Overview
I've created 4 new endpoint files for your C# Web API to enable the chat functionality:

1. **MessageEndpoints.cs** - Handle messages (get, send, mark as read)
2. **ConversationEndpoints.cs** - Handle conversations (get, create)
3. **UserEndpoints.cs** - Get user info by ID or email
4. **PropertyEndpoints.cs** - Get property details

## Step 1: Add Endpoints to Your C# Web API

In your **Program.cs** file, add these endpoint mappings:

```csharp
using IncidentWebAPI.endpoint;

var builder = WebApplication.CreateBuilder(args);

// ... your existing configuration ...

var app = builder.Build();

// ... your existing middleware ...

// Register all endpoint groups
app.MapPushSubscrptionEndpoints();
app.MapMessageEndpoints();           // NEW
app.MapConversationEndpoints();       // NEW
app.MapUserEndpoints();               // NEW
app.MapPropertyEndpoints();           // NEW

app.Run();
```

## Step 2: Ensure Database Models Exist

Make sure your `buyselwebapi.model` namespace has these models:

### Message Model
```csharp
public class Message
{
    public int id { get; set; }
    public int conversation_id { get; set; }
    public int sender_id { get; set; }
    public string content { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? read_at { get; set; }
}
```

### Conversation Model
```csharp
public class Conversation
{
    public int id { get; set; }
    public int property_id { get; set; }
    public int buyer_id { get; set; }
    public int seller_id { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? updated_at { get; set; }
}
```

### User Model (partial)
```csharp
public class User
{
    public int id { get; set; }
    public string email { get; set; }
    public string? firstname { get; set; }
    public string? lastname { get; set; }
    public string? photoazurebloburl { get; set; }
    public string? phonenumber { get; set; }
    public DateTime createdat { get; set; }
    public DateTime? updatedat { get; set; }
}
```

### Property Model (partial)
```csharp
public class Property
{
    public int id { get; set; }
    public string title { get; set; }
    public string? description { get; set; }
    public decimal price { get; set; }
    public string? address { get; set; }
    public string? city { get; set; }
    public string? state { get; set; }
    public string? zipcode { get; set; }
    public int? bedrooms { get; set; }
    public int? bathrooms { get; set; }
    public int? squarefeet { get; set; }
    public string? propertytype { get; set; }
    public string? status { get; set; }
    public int sellerid { get; set; }
    public decimal? latitude { get; set; }
    public decimal? longitude { get; set; }
    public string? photos { get; set; }
    public DateTime createdat { get; set; }
    public DateTime? updatedat { get; set; }
}
```

## Step 3: Update DbContext

In your `dbcontext` class, ensure you have these DbSets:

```csharp
public class dbcontext : DbContext
{
    // ... existing DbSets ...

    public DbSet<buyselwebapi.model.Message> messages { get; set; }
    public DbSet<buyselwebapi.model.Conversation> conversations { get; set; }
    public DbSet<buyselwebapi.model.User> users { get; set; }
    public DbSet<buyselwebapi.model.Property> properties { get; set; }

    // ... rest of your DbContext ...
}
```

## Step 4: CORS Configuration (Important!)

Make sure your CORS policy allows requests from your Next.js frontend:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://your-production-url.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ... then in the app configuration:
app.UseCors("AllowFrontend");
```

## Step 5: Test the Endpoints

After deploying your C# Web API, test these endpoints:

### Get User by Email
```
GET https://buysel.azurewebsites.net/api/user/email/test@example.com
```

### Get Conversations for User
```
GET https://buysel.azurewebsites.net/api/conversation/user/1
```

### Send a Message
```
POST https://buysel.azurewebsites.net/api/message
Body:
{
  "id": 0,
  "conversation_id": 1,
  "sender_id": 1,
  "content": "Hello!"
}
```

## Step 6: Database Migration (if needed)

If you're using Entity Framework migrations, create and apply a migration:

```bash
dotnet ef migrations add AddChatTables
dotnet ef database update
```

## Frontend is Already Configured!

Your Next.js frontend (`app/api/chat/route.ts`) is already set up to call these endpoints. Once your C# backend is deployed with these endpoints, the chat should work automatically!

## Endpoints Created

### Message Endpoints (`/api/message`)
- `GET /api/message/conversation/{conversationId}` - Get all messages in a conversation
- `POST /api/message` - Send a new message
- `PUT /api/message/markread/{userId}/{conversationId}` - Mark all messages as read

### Conversation Endpoints (`/api/conversation`)
- `GET /api/conversation/user/{userId}` - Get all conversations for a user
- `GET /api/conversation/{conversationId}` - Get conversation details
- `POST /api/conversation` - Create a new conversation

### User Endpoints (`/api/user`)
- `GET /api/user/{userId}` - Get user by ID
- `GET /api/user/email/{email}` - Get user by email

### Property Endpoints (`/api/property`)
- `GET /api/property/{propertyId}` - Get property by ID
- `GET /api/property` - Get all properties with filters

## Troubleshooting

1. **404 Not Found**: Ensure endpoints are registered in Program.cs
2. **500 Internal Server Error**: Check your database models match the endpoint expectations
3. **CORS Error**: Verify CORS is configured to allow your frontend domain
4. **Database Error**: Ensure all tables exist and have the correct schema

## Next Steps

1. Copy these 4 endpoint files to your C# Web API project
2. Register them in Program.cs
3. Verify database models and DbContext
4. Deploy to Azure
5. Test the chat functionality from your Next.js frontend!
