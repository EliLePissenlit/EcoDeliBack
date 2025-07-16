import { combineResolvers } from 'graphql-resolvers';
import { ResolverContext } from '../../types/graphql/resolverContext';
import {
  MutationCreateTaskArgs,
  MutationUpdateTaskArgs,
  MutationDeleteTaskArgs,
  MutationApproveTaskArgs,
  MutationRejectTaskArgs,
  MutationMarkAnIntermediaryStepForATaskArgs,
  MutationApplyToTaskArgs,
  MutationAcceptApplicationArgs,
  MutationRejectApplicationArgs,
  MutationCompleteTaskArgs,
  MutationValidateTaskCompletionArgs,
  MutationSendTaskMessageArgs,
  MutationMarkMessagesAsReadArgs,
  MutationStartTaskArgs,
  QueryGetTaskArgs,
  QueryGetTaskApplicationsArgs,
  QueryGetTaskMessagesArgs,
  QueryListTasksArgs,
} from '../../types/graphql/typeDefs';
import TasksWorkflow from '../../workflows/tasks';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import isAdmin from '../shared/resolvers/isAdmin';
import FileService from '../../services/files';
import AddressService from '../../services/addresses';
import { TaskApplicationModel } from '../../db/model/TaskApplicationModel';
import CategoryService from '../../services/categories';
import { TaskMessageModel } from '../../db/model/TaskMessageModel';
import { ShippingModel } from '../../db/model/ShippingModel';
import UserService from '../../services/users';
import TasksService from '../../services/tasks';

const Query = {
  getMyApplications: combineResolvers(isAuthenticated, async (parent, args, { me, logger }: ResolverContext) =>
    TasksWorkflow.getMyApplications(me.id, logger)
  ),
  getMyTasks: combineResolvers(isAuthenticated, async (parent, args, { me, logger }: ResolverContext) =>
    TasksWorkflow.getMyTasks(me.id, logger)
  ),
  getTask: combineResolvers(isAuthenticated, async (parent, { id }: QueryGetTaskArgs, { logger }: ResolverContext) =>
    TasksWorkflow.getTask(id, logger)
  ),
  getTaskApplications: combineResolvers(
    isAuthenticated,
    async (parent, { taskId }: QueryGetTaskApplicationsArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.getTaskApplications(taskId, me.id, logger)
  ),
  getTaskMessages: combineResolvers(
    isAuthenticated,
    async (parent, { taskId }: QueryGetTaskMessagesArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.getTaskMessages(taskId, me.id, logger)
  ),
  getUnreadMessagesCount: combineResolvers(isAuthenticated, async (parent, args, { me, logger }: ResolverContext) =>
    TasksWorkflow.getUnreadMessagesCount(me.id, logger)
  ),
  listPendingTasks: combineResolvers(isAdmin, async (parent, args, { logger }: ResolverContext) =>
    TasksWorkflow.listPendingTasks(logger)
  ),
  listTasks: combineResolvers(
    isAuthenticated,
    async (parent, { filters }: QueryListTasksArgs, { logger }: ResolverContext) =>
      TasksWorkflow.listTasks(filters, logger)
  ),
  listTasksByStatus: combineResolvers(isAdmin, async (parent, { status }: any, { logger }: ResolverContext) =>
    TasksWorkflow.listTasksByStatus(status, logger)
  ),
};

const Mutation = {
  acceptApplication: combineResolvers(
    isAuthenticated,
    async (parent, { applicationId }: MutationAcceptApplicationArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.acceptApplication(applicationId, me.id, logger)
  ),
  applyToTask: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationApplyToTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.applyToTask(input, me.id, logger)
  ),
  approveTask: combineResolvers(isAdmin, async (parent, { id }: MutationApproveTaskArgs, { logger }: ResolverContext) =>
    TasksWorkflow.approveTask(id, logger)
  ),
  completeTask: combineResolvers(
    isAuthenticated,
    async (parent, { taskId }: MutationCompleteTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.completeTask(taskId, me.id, logger)
  ),
  createTask: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationCreateTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.createTask(input, me.id, logger)
  ),
  deleteTask: combineResolvers(
    isAuthenticated,
    async (parent, { id }: MutationDeleteTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.deleteTask(id, me.id, logger)
  ),
  markAnIntermediaryStepForATask: combineResolvers(
    isAuthenticated,
    async (
      parent,
      { taskId, intermediaryStep }: MutationMarkAnIntermediaryStepForATaskArgs,
      { me, logger }: ResolverContext
    ) => TasksWorkflow.markAnIntermediaryStepForATask(taskId, intermediaryStep, me.id, logger)
  ),
  markMessagesAsRead: combineResolvers(
    isAuthenticated,
    async (parent, { taskId }: MutationMarkMessagesAsReadArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.markMessagesAsRead(taskId, me.id, logger)
  ),
  rejectApplication: combineResolvers(
    isAuthenticated,
    async (parent, { applicationId, reason }: MutationRejectApplicationArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.rejectApplication(applicationId, reason, me.id, logger)
  ),
  rejectTask: combineResolvers(
    isAdmin,
    async (parent, { id, reason }: MutationRejectTaskArgs, { logger }: ResolverContext) =>
      TasksWorkflow.rejectTask(id, reason, logger)
  ),
  sendTaskMessage: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationSendTaskMessageArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.sendTaskMessage(input, me.id, logger)
  ),
  startTask: combineResolvers(
    isAuthenticated,
    async (parent, { taskId }: MutationStartTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.startTask(taskId, me.id, logger)
  ),
  updateTask: combineResolvers(
    isAuthenticated,
    async (parent, { id, input }: MutationUpdateTaskArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.updateTask(id, input, me.id, logger)
  ),
  validateTaskCompletion: combineResolvers(
    isAuthenticated,
    async (parent, { taskId, validationCode }: MutationValidateTaskCompletionArgs, { me, logger }: ResolverContext) =>
      TasksWorkflow.validateTaskCompletion(taskId, validationCode, me.id, logger)
  ),
};

const Task = {
  address: async (parent: any) => AddressService.findById(parent.addressId),
  applications: async (parent: any) => {
    try {
      const applications = await TaskApplicationModel.query().where('task_id', parent.id);
      if (applications.length === 0) return [];

      const applicationsWithApplicants = await Promise.all(
        applications.map(async (application) => ({
          ...application,
          applicant: await UserService.findById(application.applicantId),
        }))
      );

      return applicationsWithApplicants;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la récupération des applications:', error);
      return [];
    }
  },
  category: async (parent: any) => CategoryService.findById(parent.categoryId),
  fileUrl: async (parent: any) => {
    if (!parent.fileId) return null;
    const file = await FileService.findById(parent.fileId);
    return FileService.createDownloadUrl(file, true);
  },
  messages: async (parent: any) => {
    const messages = await TaskMessageModel.query().where('task_id', parent.id);
    if (messages.length === 0) return [];

    return messages.map((message) => ({
      ...message,
      receiver: UserService.findById(message.receiverId),
      sender: UserService.findById(message.senderId),
    }));
  },
  shipping: async (parent: any) => {
    const shipping = await ShippingModel.query().where('task_id', parent.id);
    if (shipping.length === 0) return null;

    return shipping[0];
  },
  user: async (parent: any) => UserService.findById(parent.userId),
};

const Shipping = {
  deliveryAddress: async (parent: any) => AddressService.findById(parent.deliveryAddressId),
  pickupAddress: async (parent: any) => AddressService.findById(parent.pickupAddressId),
};

const TaskApplication = {
  applicant: async (parent: any) => UserService.findById(parent.applicantId),
  task: async (parent: any) => TasksService.findById(parent.taskId),
};

const TaskMessage = {
  receiver: async (parent: any) => UserService.findById(parent.receiverId),
  sender: async (parent: any) => UserService.findById(parent.senderId),
};

export default {
  Mutation,
  Query,
  Shipping,
  Task,
  TaskApplication,
  TaskMessage,
};
