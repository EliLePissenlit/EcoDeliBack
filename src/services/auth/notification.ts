import config from 'config';
import { EMAIL_TEMPLATES } from '../../shared/emailTemplates';
import GenericNotificationService from '../@generic/notification';
import UserService from '../users';
import { getRegistrationBlocks } from '../../shared/slackBlocks';
import { SLACK_CHANNELS } from '../../shared/slackChannels';
import NotificationService from '../notifications';
import { NotificationType } from '../../types/graphql/typeDefs';
import IS_DEV_ENVIRONNEMENT from '../../shared/isDevEnvironnement';
import logger from '../../infrastructure/logger';

class AuthNotificationService extends GenericNotificationService {
  public static async sendPasswordByEmail(email: string, password: string): Promise<void> {
    if (IS_DEV_ENVIRONNEMENT) {
      logger.info('[AUTH_NOTIFICATION_SERVICE] Sending password recovery email', {
        email,
        password,
      });
    }

    await this.sendEmail({
      dynamicTemplateData: {
        body_line1: 'Here is your password, just enter it in the app',
        body_line2: password,
        body_line3: 'If you are not the originator of this request, you can ignore this email.',
        body_line5: 'Ecodeli Team',
        button_text: 'Access the platform',
        button_url: `${config.get('server.applicationUrl')}`,
        subject: 'Password recovery',
        title: 'Password recovery',
      },
      templateId: EMAIL_TEMPLATES.SEND_PASSWORD_RECOVERY_EMAIL,
      to: email,
    });
  }

  public static async register(email: string, password: string): Promise<void> {
    await this.sendRegistrationEmailWithNotificationAndNotifyAdminOnSlack(email, password);
  }

  private static async sendRegistrationEmailWithNotificationAndNotifyAdminOnSlack(
    email: string,
    password: string
  ): Promise<void> {
    const user = await UserService.findByEmail(email);

    if (IS_DEV_ENVIRONNEMENT) {
      logger.info(
        '[AUTH_NOTIFICATION_SERVICE] Sending registration email with notification and notify admin on slack',
        {
          email,
          password,
          user,
        }
      );
    }

    await this.sendEmail({
      dynamicTemplateData: {
        body_line1: 'Thank you for joining our platform! We are happy to have you among us.',
        body_line2: 'You are in the right place to start your experience.',
        body_line3: 'Our platform offers you many possibilities to meet your needs.',
        body_line4: 'Take advantage of our welcome offers and our advantageous referral program.',
        body_line5: `Your password is: ${password}`,
        body_line6: 'Discover all our services now!',
        body_line8: 'Ecodeli Team',
        button_text: 'Access the platform',
        button_url: `${config.get('server.applicationUrl')}`,
        subject: 'Welcome to Ecodeli',
        title: 'Welcome to the Ecodeli community',
      },
      templateId: EMAIL_TEMPLATES.REGISTER,
      to: user.email,
    });

    await NotificationService.save({
      input: {
        title: 'Welcome to Ecodeli',
        type: NotificationType.Message,
        userId: user.id,
      },
    });

    await this.sendSlackMessage({
      blocks: getRegistrationBlocks(user.email),
      channel: SLACK_CHANNELS.ONBOARDING,
    });
  }
}

export default AuthNotificationService;
