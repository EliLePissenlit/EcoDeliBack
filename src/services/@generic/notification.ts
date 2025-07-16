import SendgridService, { GenericSendGridMailInput } from '../../external-services/sendgrid';
import SlackService, { GenericSlackMessageInput } from '../../external-services/slack';

abstract class GenericNotificationService {
  protected static async sendEmail(input: GenericSendGridMailInput): Promise<void> {
    if ('attachments' in input) {
      await SendgridService.sendEmailWithTemplateAndAttachments(input);
    } else {
      await SendgridService.sendEmailWithTemplate(input);
    }
  }

  protected static async sendSlackMessage(input: GenericSlackMessageInput): Promise<void> {
    if ('attachments' in input) {
      await SlackService.sendSlackMessageWithAttachmentsAndBlocks(input);
    } else {
      await SlackService.sendSlackMessageWithBlocks(input);
    }
  }
}

export default GenericNotificationService;
