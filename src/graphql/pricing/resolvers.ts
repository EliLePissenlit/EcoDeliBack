import { combineResolvers } from 'graphql-resolvers';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import PricingWorkflow from '../../workflows/pricing';

const Query = {
  calculatePriceRangeFromGeoData: combineResolvers(isAuthenticated, async (parent, { input }) =>
    PricingWorkflow.calculatePriceRangeFromGeoData(input.start, input.relayPointId, input.packageCategory)
  ),

  getPackageCategories: combineResolvers(isAuthenticated, async () => PricingWorkflow.getPackageCategories()),
};

export default {
  Query,
};
