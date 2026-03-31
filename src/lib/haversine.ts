/**
 * Calculate the distance between two geographical points using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Find users within a specified radius
 * @param centerLat Center point latitude
 * @param centerLon Center point longitude
 * @param users Array of users with location data
 * @param radiusInMeters Radius in meters (default: 50)
 * @returns Array of users within the radius with their distances
 */
export function findUsersWithinRadius(
  centerLat: number,
  centerLon: number,
  users: Array<{ latitude: number; longitude: number; [key: string]: any }>,
  radiusInMeters: number = 50,
): Array<{ distance: number; [key: string]: any }> {
  return users
    .map((user) => ({
      ...user,
      distance: calculateDistance(
        centerLat,
        centerLon,
        user.latitude,
        user.longitude,
      ),
    }))
    .filter((user) => user.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "45m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
