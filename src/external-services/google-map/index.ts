/* eslint-disable no-param-reassign */
import axios from 'axios';
import config from 'config';

import logger from '../../infrastructure/logger';

const apiKey: string = config.get('map.apiKey');

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationDetails {
  postalCode: string;
  country: string;
  city: string;
  region: string;
  street: string;
}

class MapService {
  public static async getPostalCodeAndCountryFromCoordinates({ lat, lng }: Coordinates): Promise<LocationDetails> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      return this.extractLocationDetails(response.data.results);
    } catch (error) {
      logger.error('[MAP] Error querying Google Geocode API', error);
      throw error;
    }
  }

  private static extractLocationDetails(results: any[]): LocationDetails {
    const details: LocationDetails = {
      city: '',
      country: '',
      postalCode: '',
      region: '',
      street: '',
    };

    for (const result of results) {
      for (const component of result.address_components) {
        this.updateLocationDetails(component, details);
      }
    }

    return details;
  }

  private static updateLocationDetails(component: any, details: LocationDetails) {
    if (component.types.includes('postal_code')) {
      details.postalCode = component.long_name;
    }
    if (component.types.includes('country')) {
      details.country = component.short_name;
    }
    if (component.types.includes('locality')) {
      details.city = component.long_name;
    }
    if (component.types.includes('administrative_area_level_1')) {
      details.region = component.long_name;
    }
    if (component.types.includes('route')) {
      details.street = component.long_name;
    }
  }
}

export default MapService;
