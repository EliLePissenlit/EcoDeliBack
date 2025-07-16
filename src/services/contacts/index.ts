import ContactNotificationService from './notification';
import { ContactUsInput } from '../../types/graphql/typeDefs';
import logger from '../../infrastructure/logger';

class ContactService {
  static async contactUs(input: ContactUsInput): Promise<boolean> {
    try {
      await ContactNotificationService.contactUs(input);
      return true;
    } catch (error) {
      logger.error('[ContactService] Error while sending contact us message', error);
      return false;
    }
  }
}

export default ContactService;
