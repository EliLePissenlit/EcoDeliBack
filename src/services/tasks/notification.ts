import { TaskModel } from '../../db/model/TaskModel';
import GenericNotificationService from '../@generic/notification';
import { SLACK_CHANNELS } from '../../shared/slackChannels';
import { getNewTaskNotificationBlocks, getTaskApprovalBlocks, getTaskRejectionBlocks } from '../../shared/slackBlocks';

class TaskNotificationService extends GenericNotificationService {
  static async notifyNewTask(task: TaskModel): Promise<void> {
    // Notification Slack aux admins
    await this.sendSlackMessage({
      blocks: getNewTaskNotificationBlocks(task),
      channel: SLACK_CHANNELS.ADMIN_NOTIFICATIONS,
    });
  }

  static async notifyTaskApproval(task: TaskModel): Promise<void> {
    // Notification Slack
    await this.sendSlackMessage({
      blocks: getTaskApprovalBlocks(task),
      channel: SLACK_CHANNELS.ADMIN_NOTIFICATIONS,
    });
  }

  static async notifyTaskRejection(task: TaskModel, reason: string): Promise<void> {
    // Notification Slack
    await this.sendSlackMessage({
      blocks: getTaskRejectionBlocks(task, reason),
      channel: SLACK_CHANNELS.ADMIN_NOTIFICATIONS,
    });
  }
}

export default TaskNotificationService;
