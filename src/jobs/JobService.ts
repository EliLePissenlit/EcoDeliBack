import cron from 'node-cron';
import { performance } from 'perf_hooks';
import logger from '../infrastructure/logger';
import tasks from './tasks';

class JobService {
  public static async runTask(taskName: string): Promise<void> {
    const { interval, task } = tasks[taskName];
    cron.schedule(interval, async () => {
      const startAt: number = this.startTask({ taskName });
      let payload: any;
      try {
        // Processing the task
        payload = await task();
      } catch (error) {
        logger.error(`[${taskName}] Error.`, { error });
      }
      // End of process
      this.endTask({
        payload,
        startAt,
        taskName,
      });
    });
  }

  private static startTask({ taskName }: { taskName: string }): number {
    logger.info(`[${taskName}] Start.`);
    return performance.now();
  }

  private static endTask({ payload, startAt, taskName }: { payload: any; startAt: number; taskName: string }): void {
    const endAt: number = performance.now();
    const executionInSeconds: number = (endAt - startAt) / 1000;
    logger.info(`[${taskName}] End. It took ${parseFloat(executionInSeconds.toFixed(2))} seconds.`, payload);
  }
}

export default JobService;
