import pubsub from '../../infrastructure/server/pubsub';

export type SubscriptionTopic = 'newNotification';

export type GenericSubscriptionPayload = {
  userId: string;
};

abstract class GenericSubscriptionService {
  protected static async publish(topic: SubscriptionTopic, payload: GenericSubscriptionPayload): Promise<void> {
    pubsub.publish(topic, payload);
  }
}

export default GenericSubscriptionService;
