using buyselwebapi.data;
using Microsoft.EntityFrameworkCore;

namespace IncidentWebAPI.endpoint
{
    public static class ConversationEndpoints
    {
        public static void MapConversationEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/conversation").WithTags(nameof(ConversationEndpoints));

            // GET: /api/conversation/user/{userId} - Get all conversations for a user
            group.MapGet("/user/{userId}", async (int userId, dbcontext db) =>
            {
                var conversations = await db.conversations
                    .Where(c => c.buyer_id == userId || c.seller_id == userId)
                    .OrderByDescending(c => c.created_at)
                    .Select(c => new
                    {
                        id = c.id,
                        property_id = c.property_id,
                        buyer_id = c.buyer_id,
                        seller_id = c.seller_id,
                        created_at = c.created_at,
                        updated_at = (DateTime?)null  // Not in database
                    })
                    .ToListAsync();

                return Results.Ok(conversations);
            });

            // GET: /api/conversation/{conversationId} - Get conversation details
            group.MapGet("/{conversationId}", async (int conversationId, dbcontext db) =>
            {
                var conversation = await db.conversations
                    .Where(c => c.id == conversationId)
                    .Select(c => new
                    {
                        id = c.id,
                        property_id = c.property_id,
                        buyer_id = c.buyer_id,
                        seller_id = c.seller_id,
                        created_at = c.created_at,
                        updated_at = (DateTime?)null  // Not in database
                    })
                    .FirstOrDefaultAsync();

                if (conversation == null)
                {
                    return Results.NotFound(new { error = "Conversation not found" });
                }

                return Results.Ok(conversation);
            });

            // POST: /api/conversation - Create new conversation
            group.MapPost("", async (ConversationRequest request, dbcontext db) =>
            {
                if (request.id != 0)
                {
                    return Results.BadRequest(new { error = "For new conversations, id should be 0" });
                }

                // Check if conversation already exists for this property and users
                var existing = await db.conversations
                    .FirstOrDefaultAsync(c =>
                        c.property_id == request.property_id &&
                        c.buyer_id == request.buyer_id &&
                        c.seller_id == request.seller_id);

                if (existing != null)
                {
                    // Return existing conversation
                    return Results.Ok(new
                    {
                        id = existing.id,
                        property_id = existing.property_id,
                        buyer_id = existing.buyer_id,
                        seller_id = existing.seller_id,
                        created_at = existing.created_at,
                        updated_at = (DateTime?)null  // Not in database
                    });
                }

                var conversation = new buyselwebapi.model.Conversation
                {
                    property_id = request.property_id,
                    buyer_id = request.buyer_id,
                    seller_id = request.seller_id,
                    created_at = DateTime.UtcNow
                    // updated_at will be set by database default constraint if column exists
                };

                db.conversations.Add(conversation);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    id = conversation.id,
                    property_id = conversation.property_id,
                    buyer_id = conversation.buyer_id,
                    seller_id = conversation.seller_id,
                    created_at = conversation.created_at,
                    updated_at = (DateTime?)null  // Not in database
                });
            });
        }
    }

    public record ConversationRequest(
        int id,
        int property_id,
        int buyer_id,
        int seller_id
    );
}
