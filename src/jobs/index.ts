import JobService from './JobService';
import tasks from './tasks';

const runAutoTasks = (): void => {
  Object.keys(tasks).map((taskName) => JobService.runTask(taskName));
};

export default runAutoTasks;
