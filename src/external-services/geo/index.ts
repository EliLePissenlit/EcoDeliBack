import logger from '../../infrastructure/logger';
import roundDecimals from '../../utils/roundDecimals';
import RelayPointService from '../../services/relay-points';
import AddressService from '../../services/addresses';

class GeoService {
  private static EARTH_RADIUS = 6371000;

  private static SPEED_URBAN = (30 * 1000) / 3600;

  private static SPEED_HIGHWAY = (80 * 1000) / 3600;

  private static URBAN_DISTANCE = 5000;

  public static async getDurationAndDistance(
    start: { lat: number; lon: number },
    relayPointId: string
  ): Promise<{ duration: number; distance: number }> {
    try {
      let end = { lat: 0, lon: 0 };
      const relayPoint = await RelayPointService.findById(relayPointId);
      if (!relayPoint) {
        const endAddress = await AddressService.findById(relayPointId);
        end = {
          lat: endAddress.lat,
          lon: endAddress.lng,
        };
      } else {
        const endAddress = await AddressService.findById(relayPoint.addressId);
        end = {
          lat: endAddress.lat,
          lon: endAddress.lng,
        };
      }
      const distance = this.calculateDistance(start, end);
      const duration = this.calculateDuration(distance);

      return {
        distance: roundDecimals(distance, 0),
        duration: roundDecimals(duration, 0),
      };
    } catch (error) {
      logger.error('Error during the calculation of the duration and distance', error);
      throw new Error('Impossible to calculate the duration and distance');
    }
  }

  public static async getDistance(
    start: { lat: number; lon: number },
    end: { lat: number; lon: number }
  ): Promise<number> {
    try {
      const distance = this.calculateDistance(start, end);
      return roundDecimals(distance, 0);
    } catch (error) {
      logger.error('Error during the calculation of the distance', error);
      throw new Error('Impossible to calculate the distance');
    }
  }

  private static calculateDistance(start: { lat: number; lon: number }, end: { lat: number; lon: number }): number {
    const lat1 = this.degreesToRadians(start.lat);
    const lon1 = this.degreesToRadians(start.lon);
    const lat2 = this.degreesToRadians(end.lat);
    const lon2 = this.degreesToRadians(end.lon);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS * c;
  }

  private static calculateDuration(distance: number): number {
    let duration = 0;

    if (distance <= 2 * this.URBAN_DISTANCE) {
      duration = distance / this.SPEED_URBAN;
    } else {
      const highwayDistance = distance - 2 * this.URBAN_DISTANCE;
      duration = (2 * this.URBAN_DISTANCE) / this.SPEED_URBAN + highwayDistance / this.SPEED_HIGHWAY;
    }

    return duration / 60;
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default GeoService;
