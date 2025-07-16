import { AddressModel } from '../../db/model/AddressModel';
import GenericService from '../@generic';
import logger from '../../infrastructure/logger';

interface GeoPoint {
  lat: number;
  lng: number;
}

interface AddressWithDistance extends AddressModel {
  distance?: number;
}

class AddressService extends GenericService<AddressModel> {
  constructor() {
    super(AddressModel);
  }

  /**
   * Trouve les adresses dans un rayon donné autour d'un point
   * @param center Point central (lat, lng)
   * @param radiusInMeters Rayon en mètres
   * @param limit Nombre maximum de résultats
   * @returns Liste des adresses avec leur distance
   */
  public async findAddressesInRadius(
    center: GeoPoint,
    radiusInMeters: number,
    limit = 50
  ): Promise<AddressWithDistance[]> {
    try {
      const query = this.initializeQuery()
        .select('*')
        .select(
          this.model.raw(
            `
            ST_Distance(
              geom::geography, 
              ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
            ) as distance
          `,
            [center.lng, center.lat]
          )
        )
        .whereRaw(
          `
          ST_DWithin(
            geom::geography, 
            ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, 
            ?
          )
        `,
          [center.lng, center.lat, radiusInMeters]
        )
        .orderBy('distance', 'asc')
        .limit(limit);

      return await query;
    } catch (error) {
      logger.error("Erreur lors de la recherche d'adresses dans un rayon", { center, error, radiusInMeters });
      throw new Error('Impossible de rechercher les adresses dans le rayon spécifié');
    }
  }

  /**
   * Trouve les adresses le long d'un trajet (ligne droite entre deux points)
   * @param start Point de départ
   * @param end Point d'arrivée
   * @param maxDistanceFromRoute Distance maximale de la route en mètres
   * @param limit Nombre maximum de résultats
   * @returns Liste des adresses avec leur distance à la route
   */
  public async findAddressesAlongRoute(
    start: GeoPoint,
    end: GeoPoint,
    maxDistanceFromRoute = 1000,
    limit = 50
  ): Promise<AddressWithDistance[]> {
    try {
      const query = this.initializeQuery()
        .select('*')
        .select(
          this.model.raw(
            `
            ST_Distance(
              geom::geography, 
              ST_SetSRID(ST_MakeLine(
                ST_MakePoint(?, ?), 
                ST_MakePoint(?, ?)
              ), 4326)::geography
            ) as distance
          `,
            [start.lng, start.lat, end.lng, end.lat]
          )
        )
        .whereRaw(
          `
          ST_DWithin(
            geom::geography, 
            ST_SetSRID(ST_MakeLine(
              ST_MakePoint(?, ?), 
              ST_MakePoint(?, ?)
            ), 4326)::geography, 
            ?
          )
        `,
          [start.lng, start.lat, end.lng, end.lat, maxDistanceFromRoute]
        )
        .orderBy('distance', 'asc')
        .limit(limit);

      return await query;
    } catch (error) {
      logger.error("Erreur lors de la recherche d'adresses le long d'une route", { end, error, start });
      throw new Error('Impossible de rechercher les adresses le long de la route');
    }
  }

  /**
   * Trouve les adresses dans un rectangle défini par deux points
   * @param southwest Point sud-ouest du rectangle
   * @param northeast Point nord-est du rectangle
   * @param limit Nombre maximum de résultats
   * @returns Liste des adresses dans le rectangle
   */
  public async findAddressesInBoundingBox(
    southwest: GeoPoint,
    northeast: GeoPoint,
    limit = 100
  ): Promise<AddressModel[]> {
    try {
      const query = this.initializeQuery()
        .whereRaw(
          `
          ST_Within(
            geom, 
            ST_MakeEnvelope(?, ?, ?, ?, 4326)
          )
        `,
          [southwest.lng, southwest.lat, northeast.lng, northeast.lat]
        )
        .limit(limit);

      return await query;
    } catch (error) {
      logger.error("Erreur lors de la recherche d'adresses dans un rectangle", { error, northeast, southwest });
      throw new Error('Impossible de rechercher les adresses dans le rectangle spécifié');
    }
  }

  /**
   * Trouve l'adresse la plus proche d'un point donné
   * @param point Point de référence
   * @returns L'adresse la plus proche avec sa distance
   */
  public async findNearestAddress(point: GeoPoint): Promise<AddressWithDistance | null> {
    try {
      const query = this.initializeQuery()
        .select('*')
        .select(
          this.model.raw(
            `
            ST_Distance(
              geom::geography, 
              ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
            ) as distance
          `,
            [point.lng, point.lat]
          )
        )
        .orderBy('distance', 'asc')
        .limit(1);

      const results = await query;
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      logger.error("Erreur lors de la recherche de l'adresse la plus proche", { error, point });
      throw new Error("Impossible de trouver l'adresse la plus proche");
    }
  }

  /**
   * Calcule la distance entre deux adresses
   * @param address1 Première adresse
   * @param address2 Deuxième adresse
   * @returns Distance en mètres
   */
  public async calculateDistanceBetweenAddresses(address1: AddressModel, address2: AddressModel): Promise<number> {
    try {
      const result = await this.model.raw(
        `
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
        ) as distance
      `,
        [address1.lng, address1.lat, address2.lng, address2.lat]
      );

      return result[0]?.distance || 0;
    } catch (error) {
      logger.error('Erreur lors du calcul de distance entre adresses', {
        address1: address1.id,
        address2: address2.id,
        error,
      });
      throw new Error('Impossible de calculer la distance entre les adresses');
    }
  }
}

export default new AddressService();
