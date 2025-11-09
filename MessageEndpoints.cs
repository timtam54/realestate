using buyselwebapi.data;
using Microsoft.EntityFrameworkCore;

namespace IncidentWebAPI.endpoint
{
    public static class MessageEndpoints
    {
        public static void MapMessageEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/message").WithTags(nameof(MessageEndpoints));

            // GET: /api/message/conversation/{conversationId} - Get messages for a conversation
            group.MapGet("/conversation/{conversationId}", async (int conversationId, dbcontext db) =>
            {
                var messages = await db.messages
                    .Where(m => m.conversation_id == conversationId)
                    .OrderBy(m => m.created_at)
                    .Select(m => new
                    {
                        id = m.id,
                        conversation_id = m.conversation_id,
                        sender_id = m.sender_id,
                        content = m.content,
                        created_at = m.created_at,
                        read_at = m.read_at
                    })
                    .ToListAsync();

                return Results.Ok(messages);
            });

            // POST: /api/message - Send a message
            group.MapPost("", async (MessageRequest request, dbcontext db) =>
            {
                if (request.id != 0)
                {
                    return Results.BadRequest(new { error = "For new messages, id should be 0" });
                }

                var message = new buyselwebapi.model.Message
                {
                    conversation_id = request.conversation_id,
                    sender_id = request.sender_id,
                    content = request.content,
                    created_at = DateTime.UtcNow,
                    read_at = null
                };

                db.messages.Add(message);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    id = message.id,
                    conversation_id = message.conversation_id,
                    sender_id = message.sender_id,
                    content = message.content,
                    created_at = message.created_at,
                    read_at = message.read_at
                });
            });

            // PUT: /api/message/markread/{userId}/{conversationId} - Mark all messages as read
            group.MapPut("/markread/{userId}/{conversationId}", async (int userId, int conversationId, dbcontext db) =>
            {
                // Get all unread messages in this conversation that were NOT sent by this user
                var unreadMessages = await db.messages
                    .Where(m => m.conversation_id == conversationId
                           && m.sender_id != userId
                           && m.read_at == null)
                    .ToListAsync();

                if (unreadMessages.Any())
                {
                    foreach (var message in unreadMessages)
                    {
                        message.read_at = DateTime.UtcNow;
                    }

                    await db.SaveChangesAsync();

                    return Results.Ok(new {
                        success = true,
                        marked_count = unreadMessages.Count,
                        message = $"Marked {unreadMessages.Count} messages as read"
                    });
                }

                return Results.Ok(new {
                    success = true,
                    marked_count = 0,
                    message = "No unread messages to mark"
                });
            });
        }
    }

    public record MessageRequest(
        int id,
        int conversation_id,
        int sender_id,
        string content
    );
}
