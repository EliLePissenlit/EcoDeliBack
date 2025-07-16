import logger from '../../infrastructure/logger';
import roundDecimals from '../../utils/roundDecimals';
import { PackageCategory, PackageCategoryInfo, PricingRange } from '../../types/graphql/typeDefs';
import PricingConfigService from '../pricing-configs';

class PricingService {
  // Configuration des catégories de colis
  private static readonly PACKAGE_CATEGORIES: Record<PackageCategory, PackageCategoryInfo> = {
    [PackageCategory.Small]: {
      category: PackageCategory.Small,
      description: 'Environ sac à dos',
      emoji: '🟢',
      maxVolume: 20,
      maxWeight: 5,
    },
    [PackageCategory.Medium]: {
      category: PackageCategory.Medium,
      description: 'Environ carton standard',
      emoji: '🟡',
      maxVolume: 50,
      maxWeight: 15,
    },
    [PackageCategory.Large]: {
      category: PackageCategory.Large,
      description: 'Environ valise / gros colis',
      emoji: '🔴',
      maxVolume: 100,
      maxWeight: 30,
    },
  };

  // Distance minimale pour facturer (en mètres)
  private static readonly MIN_DISTANCE = 1000; // 1km

  // Durée minimale pour facturer (en minutes)
  private static readonly MIN_DURATION = 10; // 10 minutes

  public static getPackageCategories(): PackageCategoryInfo[] {
    return Object.values(this.PACKAGE_CATEGORIES);
  }

  public static getPackageCategoryInfo(category: PackageCategory): PackageCategoryInfo {
    const categoryInfo = this.PACKAGE_CATEGORIES[category];
    if (!categoryInfo) {
      throw new Error(`Catégorie de colis invalide: ${category}`);
    }
    return categoryInfo;
  }

  public static async calculatePriceRangeFromGeoData(
    start: { lat: number; lon: number },
    relayPointId: string,
    packageCategory: PackageCategory
  ): Promise<PricingRange> {
    try {
      // Valider la catégorie en premier
      if (!this.PACKAGE_CATEGORIES[packageCategory]) {
        throw new Error(`Catégorie de colis invalide: ${packageCategory}`);
      }

      // Récupérer la configuration de prix active
      const activeConfig = await PricingConfigService.getActiveConfig();
      if (!activeConfig) {
        throw new Error('Aucune configuration de prix active trouvée');
      }

      // Import dynamique pour éviter les dépendances circulaires
      const GeoService = (await import('../../external-services/geo')).default;

      const { distance, duration } = await GeoService.getDurationAndDistance(start, relayPointId);

      // Récupérer le prix de base selon la catégorie
      let basePrice: number;
      switch (packageCategory) {
        case PackageCategory.Small:
          basePrice = activeConfig.basePriceSmall;
          break;
        case PackageCategory.Medium:
          basePrice = activeConfig.basePriceMedium;
          break;
        case PackageCategory.Large:
          basePrice = activeConfig.basePriceLarge;
          break;
        default:
          throw new Error(`Catégorie de colis invalide: ${packageCategory}`);
      }

      // Calcul du prix total
      const distanceInKm = Math.max(distance / 1000, this.MIN_DISTANCE / 1000);
      const distancePrice = distanceInKm * activeConfig.pricePerKm;
      const durationPrice = Math.max(duration, this.MIN_DURATION) * activeConfig.pricePerMinute;
      const totalPriceInCents = Math.round((basePrice + distancePrice + durationPrice) / 10) * 10;

      return {
        estimatedDistanceInMeters: roundDecimals(distance, 0),
        estimatedDurationInMinutes: roundDecimals(duration, 0),
        maxPriceInCents: totalPriceInCents,
        minPriceInCents: totalPriceInCents,
      };
    } catch (error) {
      logger.error('Erreur lors du calcul du prix avec les données géographiques', {
        error,
        packageCategory,
        relayPointId,
        start,
      });
      throw error; // Re-lancer l'erreur originale au lieu d'en créer une nouvelle
    }
  }

  /**
   * Calcule le prix pour une catégorie spécifique avec des données géographiques
   */
  public static async calculatePriceForCategory(
    category: PackageCategory,
    start: { lat: number; lon: number },
    relayPointId: string
  ): Promise<number> {
    try {
      // Récupérer la configuration de prix active
      const activeConfig = await PricingConfigService.getActiveConfig();
      if (!activeConfig) {
        throw new Error('Aucune configuration de prix active trouvée');
      }

      // Import dynamique pour éviter les dépendances circulaires
      const GeoService = (await import('../../external-services/geo')).default;

      const { distance, duration } = await GeoService.getDurationAndDistance(start, relayPointId);

      // Récupérer le prix de base selon la catégorie
      let basePrice: number;
      switch (category) {
        case PackageCategory.Small:
          basePrice = activeConfig.basePriceSmall;
          break;
        case PackageCategory.Medium:
          basePrice = activeConfig.basePriceMedium;
          break;
        case PackageCategory.Large:
          basePrice = activeConfig.basePriceLarge;
          break;
        default:
          throw new Error(`Catégorie de colis invalide: ${category}`);
      }

      // Calcul du prix total
      const distanceInKm = Math.max(distance / 1000, this.MIN_DISTANCE / 1000);
      const distancePrice = distanceInKm * activeConfig.pricePerKm;
      const durationPrice = Math.max(duration, this.MIN_DURATION) * activeConfig.pricePerMinute;

      return Math.round((basePrice + distancePrice + durationPrice) / 10) * 10;
    } catch (error) {
      logger.error('Erreur lors du calcul du prix pour la catégorie', {
        category,
        error,
        relayPointId,
        start,
      });
      throw new Error('Impossible de calculer le prix pour cette catégorie');
    }
  }
}

export default PricingService;
