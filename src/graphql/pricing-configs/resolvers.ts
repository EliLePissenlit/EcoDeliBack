import { combineResolvers } from 'graphql-resolvers';

import PricingConfigWorkflow from '../../workflows/pricing-configs';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import isAdmin from '../shared/resolvers/isAdmin';

const Query = {
  activePricingConfig: combineResolvers(
    isAuthenticated,
    async (): Promise<any | null> => PricingConfigWorkflow.getActiveConfig()
  ),
  pricingConfigs: combineResolvers(isAdmin, async (): Promise<any[]> => PricingConfigWorkflow.getAllConfigs()),
};

const Mutation = {
  activatePricingConfig: combineResolvers(
    isAdmin,
    async (parent, { id }: { id: string }): Promise<any> => PricingConfigWorkflow.activateConfig(id)
  ),
  createPricingConfig: combineResolvers(
    isAdmin,
    async (parent, { input }: { input: any }): Promise<any> => PricingConfigWorkflow.createActiveConfig(input)
  ),
  deactivatePricingConfig: combineResolvers(
    isAdmin,
    async (parent, { id }: { id: string }): Promise<any> => PricingConfigWorkflow.deactivateConfig(id)
  ),
};

export default {
  Mutation,
  Query,
};
