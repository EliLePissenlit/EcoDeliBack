import RelayPointService from '../../services/relay-points';
import { User, CreateRelayPointInput, UpdateRelayPointInput } from '../../types/graphql/typeDefs';

class RelayPointsWorkflow {
  static async listRelayPoints() {
    return RelayPointService.findAll();
  }

  static async getRelayPointById(id: string) {
    return RelayPointService.findById(id);
  }

  static async createRelayPoint(input: CreateRelayPointInput, user: User) {
    return RelayPointService.createRelayPoint(input, user);
  }

  static async updateRelayPoint(id: string, input: UpdateRelayPointInput, user: User) {
    return RelayPointService.updateRelayPoint(id, input, user);
  }

  static async deleteRelayPoint(id: string) {
    return RelayPointService.deleteById(id);
  }
}

export default RelayPointsWorkflow;
