import { getContactUsBlocks } from '../../shared/slackBlocks';
import { ContactUsInput } from '../../types/graphql/typeDefs';
import GenericNotificationService from '../@generic/notification';
import { SLACK_CHANNELS } from '../../shared/slackChannels';

class ContactNotificationService extends GenericNotificationService {
  static async contactUs(input: ContactUsInput): Promise<void> {
    await this.sendSlackMessage({
      blocks: getContactUsBlocks(input),
      channel: SLACK_CHANNELS.CONTACT_US,
    });
  }
}

export default ContactNotificationService;
