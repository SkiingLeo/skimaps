class GeofencingManager {
    constructor() {
        // Embed geofencing data directly
        this.geofences = {
            "davos": {
                bounds: {
                    minLat: 46.803525,
                    maxLat: 46.923428,
                    minLon: 9.712178,
                    maxLon: 9.893495
                },
                image_name: "davos_map_slim.jpg"
            },
            "chaeserrugg": {
                bounds: {
                    minLat: 47.145922,
                    maxLat: 47.200367,
                    minLon: 9.271875,
                    maxLon: 9.330963
                },
                image_name: "map_chaeserrugg.jpg"
            }
        };
    }

    findLocation(lat, lon) {
        for (const [name, fence] of Object.entries(this.geofences)) {
            if (lat >= fence.bounds.minLat && lat <= fence.bounds.maxLat &&
                lon >= fence.bounds.minLon && lon <= fence.bounds.maxLon) {
                return {
                    name: name,
                    image_name: fence.image_name
                };
            }
        }
        throw new Error('Location not within any known area');
    }
} 