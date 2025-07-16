import { ContactUsInput } from '../types/graphql/typeDefs';
import { TaskModel } from '../db/model/TaskModel';

export const getRegistrationBlocks = (email: string): any[] => [
  {
    text: {
      text: `*New user registration* 🆕\n\n*Email:* ${email}`,
      type: 'mrkdwn',
    },
    type: 'section',
  },
];

export const getContactUsBlocks = (input: ContactUsInput): any[] => {
  const { email, fullName, message, subject } = input;

  return [
    {
      accessory: {
        alt_text: 'sample thumbnail',
        image_url: 'https://www.stickers-garage.com/sites/stickers/themes/static/img/img-help-opti.png',
        type: 'image',
      },
      text: {
        text: `*Contact Us Details:*\n\n*Name:* ${fullName}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:* ${message}`,
        type: 'mrkdwn',
      },
      type: 'section',
    },
    {
      elements: [
        {
          action_id: 'contact_us',
          style: 'primary',
          text: {
            emoji: true,
            text: 'Answer the user',
            type: 'plain_text',
          },
          type: 'button',
          url: `mailto:${email}?subject=Re:%20${subject}`,
        },
      ],
      type: 'actions',
    },
  ];
};

export const getNewTaskNotificationBlocks = (task: TaskModel): any[] => [
  {
    text: {
      text: `*Nouvelle annonce à valider* 🆕\n\n*Titre:* ${task.title}\n*Type:* ${task.type}\n*Statut:* ${task.status}\n*ID:* ${task.id}\n\n*Description:* ${task.description}`,
      type: 'mrkdwn',
    },
    type: 'section',
  },
  {
    elements: [
      {
        action_id: 'approve_task',
        style: 'primary',
        text: {
          emoji: true,
          text: 'Approuver',
          type: 'plain_text',
        },
        type: 'button',
        value: task.id,
      },
      {
        action_id: 'reject_task',
        style: 'danger',
        text: {
          emoji: true,
          text: 'Refuser',
          type: 'plain_text',
        },
        type: 'button',
        value: task.id,
      },
    ],
    type: 'actions',
  },
];

export const getTaskApprovalBlocks = (task: TaskModel): any[] => [
  {
    text: {
      text: `*Annonce approuvée* ✅\n\n*Titre:* ${task.title}\n*Type:* ${task.type}\n*ID:* ${task.id}`,
      type: 'mrkdwn',
    },
    type: 'section',
  },
];

export const getTaskRejectionBlocks = (task: TaskModel, reason: string): any[] => [
  {
    text: {
      text: `*Annonce refusée* ❌\n\n*Titre:* ${task.title}\n*Type:* ${task.type}\n*ID:* ${task.id}\n*Raison:* ${reason}`,
      type: 'mrkdwn',
    },
    type: 'section',
  },
];
