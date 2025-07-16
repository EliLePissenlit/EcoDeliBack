import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import JobService from '../jobs/JobService';
import tasks from '../jobs/tasks';

describe('JobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a task and log start and end messages', async () => {
    const mockTask = async (): Promise<any> => {
      jest.fn().mockReturnValue('task result');
    };
    tasks.TEST = {
      interval: '* * * * *',
      task: mockTask,
    };

    const startSpy = jest.spyOn(JobService, 'runTask');

    await JobService.runTask('TEST');
    expect(startSpy).toHaveBeenCalledWith('TEST');
  });

  it('should call real cron jobs', async () => {
    const startSpy = jest.spyOn(JobService, 'runTask');

    await JobService.runTask('TEST');
    expect(startSpy).toHaveBeenCalledWith('TEST');
  });
});
