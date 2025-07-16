import startAssetsServer from './infrastructure/assets-server';
import startApolloServer from './infrastructure/server';
import runAutoTasks from './jobs';

startApolloServer();
startAssetsServer();
runAutoTasks();
