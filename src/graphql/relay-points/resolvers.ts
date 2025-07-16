import { combineResolvers } from 'graphql-resolvers';
import { Role, RelayPoint as RelayPointType } from '../../types/graphql/typeDefs';
import RelayPointsWorkflow from '../../workflows/relay-points';
import hasProperRoles from '../shared/resolvers/hasProperRoles';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import AddressService from '../../services/addresses';
import FileService from '../../services/files';
import { ResolverContext } from '../../types/graphql/resolverContext';

const Query = {
  relayPoint: combineResolvers(isAuthenticated, async (parent, { id }: { id: string }) =>
    RelayPointsWorkflow.getRelayPointById(id)
  ),
  relayPoints: combineResolvers(isAuthenticated, async () => RelayPointsWorkflow.listRelayPoints()),
};

const Mutation = {
  createRelayPoint: combineResolvers(
    hasProperRoles([Role.Admin, Role.Partner]),
    async (parent, { input }, { me }: ResolverContext) => RelayPointsWorkflow.createRelayPoint(input, me)
  ),
  deleteRelayPoint: combineResolvers(hasProperRoles([Role.Admin, Role.Partner]), async (parent, { id }) =>
    RelayPointsWorkflow.deleteRelayPoint(id)
  ),
  updateRelayPoint: combineResolvers(
    hasProperRoles([Role.Admin, Role.Partner]),
    async (parent, { id, input }, { me }: ResolverContext) => RelayPointsWorkflow.updateRelayPoint(id, input, me)
  ),
};

const RelayPoint = {
  address: async (parent: RelayPointType) => {
    if (!parent.addressId) return null;
    return AddressService.findById(parent.addressId);
  },
  fileUrl: async (parent: RelayPointType) => {
    if (!parent.fileId) return null;
    const file = await FileService.findById(parent.fileId);
    return FileService.createDownloadUrl(file, true);
  },
};

export default {
  Mutation,
  Query,
  RelayPoint,
};
