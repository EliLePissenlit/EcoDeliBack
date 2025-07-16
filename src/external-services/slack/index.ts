import { WebClient, Block } from '@slack/web-api';
import config from 'config';

import logger from '../../infrastructure/logger';
import IS_DEV_ENVIRONNEMENT from '../../shared/isDevEnvironnement';
import { ZipArchive } from '../../types/graphql/typeDefs';
import { SlackChannel } from '../../shared/slackChannels';

const token = config.get('slack.token');
const slackClient = new WebClient(token as string | undefined);

export type SlackMessageWithBlocks = {
  blocks: Block[];
  channel: SlackChannel;
};

export type SlackMessageWithAttachmentsAndBlocks = SlackMessageWithBlocks & {
  attachments: ZipArchive;
  message: string;
};

export type GenericSlackMessageInput = SlackMessageWithBlocks | SlackMessageWithAttachmentsAndBlocks;

class SlackService {
  public static async sendSlackMessageWithBlocks(input: SlackMessageWithBlocks): Promise<void> {
    try {
      if (IS_DEV_ENVIRONNEMENT) {
        logger.info(`Slack message: blocks posted in channel: ${input.channel}`);
        return;
      }
      await slackClient.chat.postMessage({
        blocks: input.blocks,
        channel: input.channel,
      });
    } catch (error) {
      logger.error('Error while sending slack message', error);
    }
  }

  public static async sendSlackMessageWithAttachmentsAndBlocks(
    input: SlackMessageWithAttachmentsAndBlocks
  ): Promise<void> {
    try {
      if (IS_DEV_ENVIRONNEMENT) {
        logger.info(`Slack message: attachments and blocks posted in channel: ${input.channel}`);
        return;
      }

      const buffer = Buffer.from(input.attachments.content, 'base64');

      await slackClient.files.uploadV2({
        channel_id: input.channel,
        file: buffer,
        filename: input.attachments.filename,
        initial_comment: input.message,
      });

      await slackClient.chat.postMessage({
        blocks: input.blocks,
        channel: input.channel,
      });
    } catch (error) {
      logger.error('Error while sending slack message', error);
    }
  }
}

export default SlackService;
