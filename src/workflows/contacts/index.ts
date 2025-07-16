import ContactService from '../../services/contacts';
import { ContactUsInput } from '../../types/graphql/typeDefs';

class ContactWorkflow {
  static async contactUs(input: ContactUsInput): Promise<boolean> {
    return ContactService.contactUs(input);
  }
}

export default ContactWorkflow;
