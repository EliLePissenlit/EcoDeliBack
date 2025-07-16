export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
  JSONObject: { input: any; output: any };
  Upload: { input: any; output: any };
};

export type Address = {
  __typename?: 'Address';
  createdAt: Scalars['String']['output'];
  fullAddress: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  locationType: Scalars['String']['output'];
  mainText: Scalars['String']['output'];
  placeId: Scalars['String']['output'];
  secondaryText: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type AddressInput = {
  fullAddress: Scalars['String']['input'];
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  locationType?: LocationType;
  mainText: Scalars['String']['input'];
  placeId: Scalars['String']['input'];
  secondaryText: Scalars['String']['input'];
};

export enum ApplicationStatus {
  Accepted = 'ACCEPTED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Validated = 'VALIDATED',
}

export type ApplyToTaskInput = {
  message: Scalars['String']['input'];
  taskId: Scalars['ID']['input'];
};

export type CancelSubscriptionInput = {
  email: Scalars['String']['input'];
  immediately?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CancelSubscriptionResponse = {
  __typename?: 'CancelSubscriptionResponse';
  message?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type Category = {
  __typename?: 'Category';
  amountInCents: Scalars['Int']['output'];
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fileId?: Maybe<Scalars['ID']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ContactUsInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  message: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type ContactUsersInput = {
  message: Scalars['String']['input'];
  users: Array<Scalars['ID']['input']>;
};

export type CreateCategoryInput = {
  amountInCents?: InputMaybe<Scalars['Int']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  name: Scalars['String']['input'];
};

export type CreateCustomPaymentInput = {
  amount: Scalars['Int']['input'];
  couponCode?: InputMaybe<Scalars['String']['input']>;
  currency: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type CreateFileInput = {
  file: Scalars['Upload']['input'];
};

export type CreateFilesInput = {
  files: Array<Scalars['Upload']['input']>;
};

export type CreatePricingConfigInput = {
  basePriceLarge: Scalars['Int']['input'];
  basePriceMedium: Scalars['Int']['input'];
  basePriceSmall: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  pricePerKm: Scalars['Int']['input'];
  pricePerMinute: Scalars['Int']['input'];
};

export type CreateRelayPointInput = {
  address?: InputMaybe<AddressInput>;
  description: Scalars['String']['input'];
  file?: InputMaybe<Scalars['Upload']['input']>;
  name: Scalars['String']['input'];
  openingDays: Array<Scalars['JSONObject']['input']>;
};

export type CreateSubscriptionInput = {
  autoRenew?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  priceId: Scalars['String']['input'];
};

export type CreateTaskInput = {
  address: AddressInput;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  deliveryAddress?: InputMaybe<AddressInput>;
  description: Scalars['String']['input'];
  estimatedDuration?: InputMaybe<Scalars['Int']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  packageCategory?: InputMaybe<PackageCategory>;
  packageDetails?: InputMaybe<Scalars['JSONObject']['input']>;
  pickupAddress?: InputMaybe<AddressInput>;
  relayPointId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  type: TaskType;
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  downloadUrl?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  fileType: FileType;
  id: Scalars['ID']['output'];
  isFolder: Scalars['Boolean']['output'];
  parentFolderId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export enum FileType {
  CategoryIcon = 'CATEGORY_ICON',
  CategoryIconFolder = 'CATEGORY_ICON_FOLDER',
  Folder = 'FOLDER',
  Invoice = 'INVOICE',
  Other = 'OTHER',
  RelayPointImage = 'RELAY_POINT_IMAGE',
  RelayPointImageFolder = 'RELAY_POINT_IMAGE_FOLDER',
  TaskImage = 'TASK_IMAGE',
  TaskImageFolder = 'TASK_IMAGE_FOLDER',
  UserAvatar = 'USER_AVATAR',
  UserAvatarFolder = 'USER_AVATAR_FOLDER',
  UserFolder = 'USER_FOLDER',
  UserInvoicesFolder = 'USER_INVOICES_FOLDER',
}

export type GeoCoordinates = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};

export type GeoPricingInput = {
  packageCategory: PackageCategory;
  relayPointId: Scalars['String']['input'];
  start: GeoCoordinates;
};

export enum LocationType {
  GpsLocation = 'GPS_LOCATION',
  IpLocation = 'IP_LOCATION',
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum MessageType {
  System = 'SYSTEM',
  Text = 'TEXT',
  ValidationCode = 'VALIDATION_CODE',
}

export type Mutation = {
  __typename?: 'Mutation';
  acceptApplication: TaskApplication;
  activatePricingConfig: Scalars['Boolean']['output'];
  applyToTask: TaskApplication;
  approveTask: Task;
  cancelSubscription: CancelSubscriptionResponse;
  changePasswordWhileLoggedIn: Token;
  completeTask: Task;
  contactUs: Scalars['Boolean']['output'];
  contactUsers: Scalars['Boolean']['output'];
  createCategory?: Maybe<Category>;
  createCustomPayment: PaymentIntentResponse;
  createFiles: Array<File>;
  createFolder: File;
  createPricingConfig: PricingConfig;
  createRelayPoint: RelayPoint;
  createSubscription: SubscriptionResponse;
  createTask: Task;
  deactivatePricingConfig: Scalars['Boolean']['output'];
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteFile: Scalars['Boolean']['output'];
  deletePaymentMethod: Scalars['Boolean']['output'];
  deleteRelayPoint: Scalars['Boolean']['output'];
  deleteTask: Scalars['Boolean']['output'];
  login: Token;
  markAllNotificationsAsRead: Scalars['Boolean']['output'];
  markAnIntermediaryStepForATask: Task;
  markMessagesAsRead: Scalars['Boolean']['output'];
  register: Scalars['Boolean']['output'];
  rejectApplication: TaskApplication;
  rejectTask: Task;
  resetPasswordAndSendItByEmail: Scalars['Boolean']['output'];
  saveLastPosition: User;
  sendTaskMessage: TaskMessage;
  startTask: Task;
  suspendUser: User;
  unsubscribe: Scalars['Boolean']['output'];
  updateCategory?: Maybe<Category>;
  updateRelayPoint: RelayPoint;
  updateTask: Task;
  updateUser: User;
  uploadAvatar: File;
  validateTaskCompletion: Task;
};

export type MutationAcceptApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};

export type MutationActivatePricingConfigArgs = {
  id: Scalars['ID']['input'];
};

export type MutationApplyToTaskArgs = {
  input: ApplyToTaskInput;
};

export type MutationApproveTaskArgs = {
  id: Scalars['ID']['input'];
};

export type MutationCancelSubscriptionArgs = {
  input: CancelSubscriptionInput;
};

export type MutationChangePasswordWhileLoggedInArgs = {
  input: ChangePasswordInput;
};

export type MutationCompleteTaskArgs = {
  taskId: Scalars['ID']['input'];
};

export type MutationContactUsArgs = {
  input: ContactUsInput;
};

export type MutationContactUsersArgs = {
  input: ContactUsersInput;
};

export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};

export type MutationCreateCustomPaymentArgs = {
  input: CreateCustomPaymentInput;
};

export type MutationCreateFilesArgs = {
  files: Array<Scalars['Upload']['input']>;
  parentFolderId?: InputMaybe<Scalars['ID']['input']>;
};

export type MutationCreateFolderArgs = {
  name: Scalars['String']['input'];
  parentFolderId?: InputMaybe<Scalars['ID']['input']>;
};

export type MutationCreatePricingConfigArgs = {
  input: CreatePricingConfigInput;
};

export type MutationCreateRelayPointArgs = {
  input: CreateRelayPointInput;
};

export type MutationCreateSubscriptionArgs = {
  input: CreateSubscriptionInput;
};

export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};

export type MutationDeactivatePricingConfigArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePaymentMethodArgs = {
  paymentMethodId: Scalars['ID']['input'];
};

export type MutationDeleteRelayPointArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationMarkAnIntermediaryStepForATaskArgs = {
  intermediaryStep: AddressInput;
  taskId: Scalars['ID']['input'];
};

export type MutationMarkMessagesAsReadArgs = {
  taskId: Scalars['ID']['input'];
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationRejectApplicationArgs = {
  applicationId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

export type MutationRejectTaskArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

export type MutationResetPasswordAndSendItByEmailArgs = {
  input: ResetPasswordInput;
};

export type MutationSaveLastPositionArgs = {
  input: AddressInput;
};

export type MutationSendTaskMessageArgs = {
  input: SendTaskMessageInput;
};

export type MutationStartTaskArgs = {
  taskId: Scalars['ID']['input'];
};

export type MutationSuspendUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationUnsubscribeArgs = {
  input: UnsubscribeInput;
};

export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};

export type MutationUpdateRelayPointArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRelayPointInput;
};

export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUploadAvatarArgs = {
  file: Scalars['Upload']['input'];
};

export type MutationValidateTaskCompletionArgs = {
  taskId: Scalars['ID']['input'];
  validationCode: Scalars['String']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: NotificationType;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export enum NotificationType {
  InvoiceAdded = 'INVOICE_ADDED',
  Message = 'MESSAGE',
  TaskApplicationAccepted = 'TASK_APPLICATION_ACCEPTED',
  TaskApplicationReceived = 'TASK_APPLICATION_RECEIVED',
  TaskApplicationRejected = 'TASK_APPLICATION_REJECTED',
  TaskCompleted = 'TASK_COMPLETED',
  TaskStatusChanged = 'TASK_STATUS_CHANGED',
  TaskValidated = 'TASK_VALIDATED',
  TransactionStatusUpdated = 'TRANSACTION_STATUS_UPDATED',
}

export type OpeningDay = {
  __typename?: 'OpeningDay';
  close: Scalars['String']['output'];
  day: Scalars['String']['output'];
  isOpen: Scalars['Boolean']['output'];
  open: Scalars['String']['output'];
};

export type OpeningDayInput = {
  close: Scalars['String']['input'];
  day: Scalars['String']['input'];
  isOpen: Scalars['Boolean']['input'];
  open: Scalars['String']['input'];
};

export enum PackageCategory {
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL',
}

export type PackageCategoryInfo = {
  __typename?: 'PackageCategoryInfo';
  category: PackageCategory;
  description: Scalars['String']['output'];
  emoji: Scalars['String']['output'];
  maxVolume: Scalars['Int']['output'];
  maxWeight: Scalars['Int']['output'];
};

export type PaymentIntentResponse = {
  __typename?: 'PaymentIntentResponse';
  amount: Scalars['Float']['output'];
  clientSecret: Scalars['String']['output'];
  intentId: Scalars['String']['output'];
  transactions: Array<Transaction>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  brand: Scalars['String']['output'];
  expiryMonth: Scalars['Int']['output'];
  expiryYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  last4: Scalars['String']['output'];
};

export type PricingConfig = {
  __typename?: 'PricingConfig';
  basePriceLarge: Scalars['Int']['output'];
  basePriceMedium: Scalars['Int']['output'];
  basePriceSmall: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pricePerKm: Scalars['Int']['output'];
  pricePerMinute: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type PricingRange = {
  __typename?: 'PricingRange';
  estimatedDistanceInMeters: Scalars['Float']['output'];
  estimatedDurationInMinutes: Scalars['Float']['output'];
  maxPriceInCents: Scalars['Int']['output'];
  minPriceInCents: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  activePricingConfig?: Maybe<PricingConfig>;
  calculatePriceRangeFromGeoData: PricingRange;
  getActiveSubscriptions: Array<Transaction>;
  getCategories: Array<Category>;
  getCategory?: Maybe<Category>;
  getFileById: File;
  getMyApplications: Array<TaskApplication>;
  getMyTasks: Array<Task>;
  getNotifications: Array<Notification>;
  getPackageCategories: Array<PackageCategoryInfo>;
  getTask?: Maybe<Task>;
  getTaskApplications: Array<TaskApplication>;
  getTaskMessages: Array<TaskMessage>;
  getTransaction?: Maybe<Transaction>;
  getUnreadMessagesCount: Scalars['Int']['output'];
  getUserPaymentMethods: Array<PaymentMethod>;
  getUserTransactions: Array<Transaction>;
  listFiles: Array<File>;
  listFilesInFolder: Array<File>;
  listPendingTasks: Array<Task>;
  listTasks: Array<Task>;
  listTasksByStatus: Array<Task>;
  listUsers: Array<User>;
  me?: Maybe<User>;
  pricingConfigs: Array<PricingConfig>;
  relayPoint?: Maybe<RelayPoint>;
  relayPoints: Array<RelayPoint>;
};

export type QueryCalculatePriceRangeFromGeoDataArgs = {
  input: GeoPricingInput;
};

export type QueryGetCategoryArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetFileByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetTaskArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetTaskApplicationsArgs = {
  taskId: Scalars['ID']['input'];
};

export type QueryGetTaskMessagesArgs = {
  taskId: Scalars['ID']['input'];
};

export type QueryGetTransactionArgs = {
  id: Scalars['ID']['input'];
};

export type QueryListFilesInFolderArgs = {
  folderId: Scalars['ID']['input'];
};

export type QueryListTasksArgs = {
  filters?: InputMaybe<TaskFilters>;
};

export type QueryListTasksByStatusArgs = {
  status: TaskStatus;
};

export type QueryRelayPointArgs = {
  id: Scalars['ID']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
};

export type RelayPoint = {
  __typename?: 'RelayPoint';
  address?: Maybe<Address>;
  addressId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  fileId?: Maybe<Scalars['ID']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  openingDays: Array<OpeningDay>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ResetPasswordInput = {
  email: Scalars['String']['input'];
};

export enum Role {
  Admin = 'ADMIN',
  Basic = 'BASIC',
  Partner = 'PARTNER',
  SuperAdmin = 'SUPER_ADMIN',
  Tester = 'TESTER',
}

export type SendTaskMessageInput = {
  content: Scalars['String']['input'];
  messageType?: InputMaybe<MessageType>;
  receiverId: Scalars['ID']['input'];
  taskId: Scalars['ID']['input'];
};

export type Shipping = {
  __typename?: 'Shipping';
  calculatedPriceInCents?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveryAddress: Address;
  deliveryAddressId: Scalars['ID']['output'];
  estimatedDistanceInMeters?: Maybe<Scalars['Float']['output']>;
  estimatedDurationInMinutes?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  packageCategory: PackageCategory;
  packageDetails?: Maybe<Scalars['JSONObject']['output']>;
  pickupAddress: Address;
  pickupAddressId: Scalars['ID']['output'];
  taskId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum SortByFilterOptions {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type Subscription = {
  __typename?: 'Subscription';
  onNewNotification: Notification;
};

export type SubscriptionResponse = {
  __typename?: 'SubscriptionResponse';
  clientSecret: Scalars['String']['output'];
  intentId: Scalars['String']['output'];
  transaction: Transaction;
};

export type Task = {
  __typename?: 'Task';
  address: Address;
  addressId: Scalars['ID']['output'];
  applications: Array<TaskApplication>;
  calculatedPriceInCents?: Maybe<Scalars['Int']['output']>;
  category?: Maybe<Category>;
  categoryId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  estimatedDuration?: Maybe<Scalars['Int']['output']>;
  fileId?: Maybe<Scalars['ID']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  messages: Array<TaskMessage>;
  shipping?: Maybe<Shipping>;
  status: TaskStatus;
  title: Scalars['String']['output'];
  type: TaskType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
  validatedAt?: Maybe<Scalars['DateTime']['output']>;
  validationCode?: Maybe<Scalars['String']['output']>;
};

export type TaskApplication = {
  __typename?: 'TaskApplication';
  applicant: User;
  applicantId: Scalars['ID']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: ApplicationStatus;
  task: Task;
  taskId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  validatedAt?: Maybe<Scalars['DateTime']['output']>;
  validationCode?: Maybe<Scalars['String']['output']>;
};

export type TaskFilters = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  durationMax?: InputMaybe<Scalars['Int']['input']>;
  durationMin?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<AddressInput>;
  radius?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TaskStatus>;
  type?: InputMaybe<TaskType>;
};

export type TaskMessage = {
  __typename?: 'TaskMessage';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  messageType: MessageType;
  receiver: User;
  receiverId: Scalars['ID']['output'];
  sender: User;
  senderId: Scalars['ID']['output'];
  taskId: Scalars['ID']['output'];
};

export enum TaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Done = 'DONE',
  Draft = 'DRAFT',
  InProgress = 'IN_PROGRESS',
  Published = 'PUBLISHED',
}

export enum TaskType {
  Service = 'SERVICE',
  Shipping = 'SHIPPING',
}

export type Token = {
  __typename?: 'Token';
  token: Scalars['String']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amountInCents: Scalars['Int']['output'];
  autoRenew?: Maybe<Scalars['Boolean']['output']>;
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSubscription: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  priceId?: Maybe<Scalars['String']['output']>;
  relatedInvoice?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
  stripeCustomerId: Scalars['String']['output'];
  stripeIntentId?: Maybe<Scalars['String']['output']>;
  stripeInvoiceId?: Maybe<Scalars['String']['output']>;
  stripePriceId: Scalars['String']['output'];
  stripeSubscriptionId?: Maybe<Scalars['String']['output']>;
  trialEnd?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export enum TransactionStatus {
  Canceled = 'CANCELED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  SubscriptionActive = 'SUBSCRIPTION_ACTIVE',
  SubscriptionCanceled = 'SUBSCRIPTION_CANCELED',
  SubscriptionExpired = 'SUBSCRIPTION_EXPIRED',
  SubscriptionInitiated = 'SUBSCRIPTION_INITIATED',
  Succeeded = 'SUCCEEDED',
}

export type UnsubscribeInput = {
  message?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryInput = {
  amountInCents?: InputMaybe<Scalars['Int']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRelayPointInput = {
  address?: InputMaybe<AddressInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingDays?: InputMaybe<Array<Scalars['JSONObject']['input']>>;
};

export type UpdateTaskInput = {
  address?: InputMaybe<AddressInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDuration?: InputMaybe<Scalars['Int']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  packageDetails?: InputMaybe<Scalars['JSONObject']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSuspended: Scalars['Boolean']['output'];
  isUnderSurveillance: Scalars['Boolean']['output'];
  isUserEmailVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  passwordUpdatedAt?: Maybe<Scalars['DateTime']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: Role;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ZipArchive = {
  __typename?: 'ZipArchive';
  content: Scalars['String']['output'];
  filename: Scalars['String']['output'];
};
