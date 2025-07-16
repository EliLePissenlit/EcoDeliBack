import sendgrid from '@sendgrid/mail';
import config from 'config';

import logger from '../../infrastructure/logger';
import IS_DEV_ENVIRONNEMENT from '../../shared/isDevEnvironnement';
import { Maybe } from '../../types/graphql/typeDefs';

const sendgridApiKey: string = config.get('sendgrid.apiKey');
sendgrid.setApiKey(sendgridApiKey);

export type EmailTemplateData = {
  subject: string;
  title: string;
  button_text?: Maybe<string>;
  button_url?: Maybe<string>;
  body_line1: string;
  body_line2?: Maybe<string>;
  body_line3?: Maybe<string>;
  body_line4?: Maybe<string>;
  body_line5?: Maybe<string>;
  body_line6?: Maybe<string>;
  body_line7?: Maybe<string>;
  body_line8?: Maybe<string>;
};

export type SendGridMailWithTemplate = {
  to: string;
  templateId: string;
  dynamicTemplateData: EmailTemplateData;
};

export type SendGridMailWithTemplateAndAttachments = SendGridMailWithTemplate & {
  attachments: Attachment[];
};

export type GenericSendGridMailInput = SendGridMailWithTemplate | SendGridMailWithTemplateAndAttachments;

export type Attachment = {
  content: string;
  filename: string;
  type: string;
  disposition: string;
};

const CONTACT_EMAILS = {
  ME: 'contact@ecodeli.fr',
};

class SendgridService {
  public static async sendEmailWithTemplate(input: SendGridMailWithTemplate): Promise<boolean> {
    try {
      if (IS_DEV_ENVIRONNEMENT) {
        logger.info(`Email sent to ${input.to} with template ${input.templateId}`);
      } else {
        await sendgrid.send({
          dynamicTemplateData: input.dynamicTemplateData,
          from: {
            email: CONTACT_EMAILS.ME,
            name: 'Ecodeli Team',
          },
          templateId: input.templateId,
          to: input.to,
        });
      }
      return true;
    } catch (error) {
      logger.error('Error while sending email with template', { error });

      return false;
    }
  }

  public static async sendEmailWithTemplateAndAttachments(
    input: SendGridMailWithTemplateAndAttachments
  ): Promise<boolean> {
    try {
      if (IS_DEV_ENVIRONNEMENT) {
        logger.info(`Email sent to ${input.to} with template ${input.templateId}`);
      } else {
        await sendgrid.send({
          attachments: input.attachments,
          dynamicTemplateData: input.dynamicTemplateData,
          from: {
            email: CONTACT_EMAILS.ME,
            name: 'Ecodeli Team',
          },
          templateId: input.templateId,
          to: input.to,
        });
      }
      return true;
    } catch (error) {
      logger.error('Error while sending email with template and attachments', { error });

      return false;
    }
  }
}

export default SendgridService;
