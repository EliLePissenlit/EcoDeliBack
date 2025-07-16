import { User, Notification, ContactUsersInput, NotificationType } from '../../types/graphql/typeDefs';
import NotificationService from '../../services/notifications';
import UserService from '../../services/users';
import SendgridService from '../../external-services/sendgrid';
import { EMAIL_TEMPLATES } from '../../shared/emailTemplates';

class NotificationWorkflow {
  static async getNotifications(me: User): Promise<Notification[]> {
    return NotificationService.getNotifications(me.id);
  }

  static async markAllNotificationsAsRead(me: User): Promise<boolean> {
    return NotificationService.markAllNotificationsAsRead(me.id);
  }

  static async contactUsers(input: ContactUsersInput): Promise<boolean> {
    const { message, users } = input;

    const usersToNotify = await UserService.initializeQuery().whereIn('id', users);

    for (const user of usersToNotify) {
      await SendgridService.sendEmailWithTemplate({
        dynamicTemplateData: {
          body_line1: message,
          subject: 'New message',
          title: 'New message',
        },
        templateId: EMAIL_TEMPLATES.CONTACT_USERS,
        to: user.email,
      });

      await NotificationService.save({
        input: {
          title: message,
          type: NotificationType.Message,
          userId: user.id,
        },
      });
    }

    return true;
  }
}

export default NotificationWorkflow;
