using buyselwebapi.data;
using Microsoft.EntityFrameworkCore;

namespace IncidentWebAPI.endpoint
{
    public static class PropertyEndpoints
    {
        public static void MapPropertyEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/api/property").WithTags(nameof(PropertyEndpoints));

            // GET: /api/property/{propertyId} - Get property by ID
            group.MapGet("/{propertyId}", async (int propertyId, dbcontext db) =>
            {
                var property = await db.properties
                    .Where(p => p.id == propertyId)
                    .Select(p => new
                    {
                        id = p.id,
                        title = p.title,
                        description = (string)null,  // Not in database
                        price = p.price,
                        address = p.address,
                        city = p.suburb,
                        state = p.state,
                        zipcode = p.postcode,
                        bedrooms = p.beds,
                        bathrooms = p.baths,
                        squarefeet = p.landsize,
                        propertytype = p.typeofprop,
                        status = p.status,
                        sellerid = p.sellerid,
                        latitude = p.lat,
                        longitude = p.lon,
                        photos = (string)null,  // Not in database, might need separate photos table
                        createdat = p.dte,
                        updatedat = (DateTime?)null  // Not in database
                    })
                    .FirstOrDefaultAsync();

                if (property == null)
                {
                    return Results.NotFound(new { error = "Property not found" });
                }

                return Results.Ok(property);
            });

            // GET: /api/property - Get all properties (with optional filters)
            group.MapGet("", async (
                string? city,
                string? state,
                decimal? minPrice,
                decimal? maxPrice,
                int? minBedrooms,
                string? propertyType,
                string? status,
                dbcontext db) =>
            {
                var query = db.properties.AsQueryable();

                if (!string.IsNullOrEmpty(city))
                    query = query.Where(p => p.suburb == city);

                if (!string.IsNullOrEmpty(state))
                    query = query.Where(p => p.state == state);

                if (minPrice.HasValue)
                    query = query.Where(p => p.price >= minPrice.Value);

                if (maxPrice.HasValue)
                    query = query.Where(p => p.price <= maxPrice.Value);

                if (minBedrooms.HasValue)
                    query = query.Where(p => p.beds >= minBedrooms.Value);

                if (!string.IsNullOrEmpty(propertyType))
                    query = query.Where(p => p.typeofprop == propertyType);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(p => p.status == status);

                var properties = await query
                    .OrderByDescending(p => p.dte)
                    .Select(p => new
                    {
                        id = p.id,
                        title = p.title,
                        description = (string)null,  // Not in database
                        price = p.price,
                        address = p.address,
                        city = p.suburb,
                        state = p.state,
                        zipcode = p.postcode,
                        bedrooms = p.beds,
                        bathrooms = p.baths,
                        squarefeet = p.landsize,
                        propertytype = p.typeofprop,
                        status = p.status,
                        sellerid = p.sellerid,
                        latitude = p.lat,
                        longitude = p.lon,
                        photos = (string)null,  // Not in database, might need separate photos table
                        createdat = p.dte,
                        updatedat = (DateTime?)null  // Not in database
                    })
                    .ToListAsync();

                return Results.Ok(properties);
            });
        }
    }
}
