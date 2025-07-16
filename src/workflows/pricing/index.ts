import PricingService from '../../services/pricing';
import { PricingRange, PackageCategory } from '../../types/graphql/typeDefs';

class PricingWorkflow {
  public static getPackageCategories() {
    return PricingService.getPackageCategories();
  }

  public static async calculatePriceRangeFromGeoData(
    start: { lat: number; lon: number },
    relayPointId: string,
    packageCategory: PackageCategory
  ): Promise<PricingRange> {
    return PricingService.calculatePriceRangeFromGeoData(start, relayPointId, packageCategory);
  }
}

export default PricingWorkflow;
