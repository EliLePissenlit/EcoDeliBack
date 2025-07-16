import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import path from 'path';
import GenericService from '../@generic';
import { FileModel } from '../../db/model/FileModel';
import { File, FileType, User, NotificationType } from '../../types/graphql/typeDefs';
import CloudStorageService from '../../external-services/google-cloud-storage';
import UserService from '../users';
import NotificationService from '../notifications';
import logger from '../../infrastructure/logger';

class FileService extends GenericService<FileModel> {
  constructor() {
    super(FileModel);
  }

  public async createRootFolder(user: User): Promise<File> {
    return this.save({
      input: {
        displayName: `${user.email}`,
        fileName: `${user.email}`,
        fileType: FileType.UserFolder,
        isFolder: true,
        userId: user.id,
      },
    });
  }

  public async createAvatarRootFolder(user: User): Promise<File> {
    return this.save({
      input: {
        displayName: `${user.email}`,
        fileName: `${user.email}`,
        fileType: FileType.UserAvatarFolder,
        isFolder: true,
        userId: user.id,
      },
    });
  }

  public async createInvoicesFolder(user: User): Promise<File> {
    const rootFolder = await this.getRootFolderByUser(user.id);

    return this.save({
      input: {
        displayName: 'Invoices',
        fileName: 'Invoices',
        fileType: FileType.UserInvoicesFolder,
        isFolder: true,
        parentFolderId: rootFolder.id,
        userId: user.id,
      },
    });
  }

  public async createRootFolders(
    user: User
  ): Promise<{ rootFolder: File; avatarRootFolder: File; invoicesRootFolder: File }> {
    const rootFolder = await this.createRootFolder(user);
    const avatarRootFolder = await this.createAvatarRootFolder(user);
    const invoicesRootFolder = await this.createInvoicesFolder(user);

    return {
      avatarRootFolder,
      invoicesRootFolder,
      rootFolder,
    };
  }

  public async getRootFolderByUser(ownerId: string): Promise<File> {
    const rootFolder = await this.findOne({
      fileType: FileType.UserFolder,
      isFolder: true,
      parentFolderId: null,
      userId: ownerId,
    });

    if (!rootFolder) {
      const user = await UserService.findById(ownerId);
      return this.createRootFolder(user);
    }

    return rootFolder;
  }

  public async getInvoicesRootFolderByUser(ownerId: string): Promise<File> {
    const rootFolder = await this.getRootFolderByUser(ownerId);
    const user = await UserService.findById(ownerId);

    const invoicesRootFolder = await this.findOne({
      fileType: FileType.UserInvoicesFolder,
      isFolder: true,
      parentFolderId: rootFolder.id,
      userId: ownerId,
    });

    if (!invoicesRootFolder) {
      return this.createInvoicesFolder(user);
    }

    return invoicesRootFolder;
  }

  public async getAvatarRootFolderByUser(ownerId: string): Promise<File> {
    return this.findOne({ fileType: FileType.UserAvatarFolder, isFolder: true, parentFolderId: null, userId: ownerId });
  }

  public async createDownloadUrl(file: File, isPublicUrl?: boolean): Promise<string> {
    try {
      let filePath = '';

      if (file.fileType === FileType.RelayPointImage) {
        const relayPointRootFolder = await this.getOrCreateRelayPointRootFolder(file.userId);
        filePath = `${relayPointRootFolder.displayName}/${file.fileName}`;
      }

      if (file.fileType === FileType.CategoryIcon) {
        const categoryIconRootFolder = await this.getOrCreateCategoryIconRootFolder(file.userId);
        filePath = `${categoryIconRootFolder.displayName}/${file.fileName}`;
      }

      if (file.fileType === FileType.TaskImage) {
        const taskFileRootFolder = await this.getOrCreateTaskFileRootFolder(file.userId);
        filePath = `${taskFileRootFolder.displayName}/${file.fileName}`;
      }

      const ownerRootFolder = await this.getRootFolderByUser(file.userId);
      const parentFolder = file.parentFolderId ? await this.findById(file.parentFolderId) : null;

      if (file.fileType === FileType.UserAvatar) {
        return CloudStorageService.getAvatarDownloadUrl(`${ownerRootFolder.displayName}/${file.fileName}`);
      }

      if (!parentFolder || parentFolder.id === ownerRootFolder.id) {
        filePath = `${ownerRootFolder.displayName}/${file.fileName}`;
      } else {
        filePath = `${ownerRootFolder.displayName}/${parentFolder.displayName}/${file.fileName}`;
      }

      if (filePath) {
        return CloudStorageService.getPublicFilesDownloadUrl(filePath);
      }

      return isPublicUrl
        ? CloudStorageService.getPublicDownloadUrl(filePath)
        : CloudStorageService.getDownloadUrl(filePath);
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Failed to construct url', { error, file });
      return '';
    }
  }

  public async createAvatar({
    content,
    displayName,
    fileType,
    user,
  }: {
    content: Buffer;
    displayName: string;
    fileType: FileType;
    user: User;
  }): Promise<File> {
    const rootFolder: File = await this.getRootFolderByUser(user.id);

    const uniqueId = randomUUID();

    const fileName = `${uniqueId}${path.extname(displayName)}`;

    await CloudStorageService.uploadAvatar({
      content,
      destFileName: `${rootFolder.displayName}/${fileName}`,
    });

    return this.save({
      input: {
        displayName,
        fileName,
        fileType,
        parentFolderId: rootFolder.id,
        userId: user.id,
      },
    });
  }

  public async getOrCreateRelayPointRootFolder(userId: string): Promise<File> {
    const relayPointRootFolder = await this.findOne({
      fileType: FileType.RelayPointImageFolder,
      userId,
    });

    if (!relayPointRootFolder) {
      const userRootFolder = await this.getRootFolderByUser(userId);

      return this.save({
        input: {
          displayName: 'Relay Points',
          fileName: 'Relay Points',
          fileType: FileType.RelayPointImageFolder,
          isFolder: true,
          parentFolderId: userRootFolder.id,
          userId,
        },
      });
    }

    return relayPointRootFolder;
  }

  public async getOrCreateCategoryIconRootFolder(userId: string): Promise<File> {
    const categoryIconRootFolder = await this.findOne({
      fileType: FileType.CategoryIconFolder,
      userId,
    });

    if (!categoryIconRootFolder) {
      const userRootFolder = await this.getRootFolderByUser(userId);

      return this.save({
        input: {
          displayName: 'Category Icons',
          fileName: 'Category Icons',
          fileType: FileType.CategoryIconFolder,
          isFolder: true,
          parentFolderId: userRootFolder.id,
          userId,
        },
      });
    }

    return categoryIconRootFolder;
  }

  public async getOrCreateTaskFileRootFolder(userId: string): Promise<File> {
    const taskFileRootFolder = await this.findOne({
      fileType: FileType.TaskImageFolder,
      userId,
    });

    if (!taskFileRootFolder) {
      const userRootFolder = await this.getRootFolderByUser(userId);

      return this.save({
        input: {
          displayName: 'Task Files',
          fileName: 'Task Files',
          fileType: FileType.TaskImageFolder,
          isFolder: true,
          parentFolderId: userRootFolder.id,
          userId,
        },
      });
    }

    return taskFileRootFolder;
  }

  public async createAndUploadFile({
    content,
    displayName,
    fileType = FileType.Other,
    requestedFolderId,
    user,
  }: {
    fileType: FileType;
    content: Buffer;
    displayName: string;
    requestedFolderId?: string;
    user: User;
  }): Promise<File> {
    const uniqueId = randomUUID();

    const fileName = `${uniqueId}${path.extname(displayName)}`;

    if (fileType === FileType.RelayPointImage) {
      const relayPointRootFolder = await this.getOrCreateRelayPointRootFolder(user.id);
      // eslint-disable-next-line no-param-reassign
      requestedFolderId = relayPointRootFolder.id;
    }

    if (fileType === FileType.CategoryIcon) {
      const categoryIconRootFolder = await this.getOrCreateCategoryIconRootFolder(user.id);
      // eslint-disable-next-line no-param-reassign
      requestedFolderId = categoryIconRootFolder.id;
    }

    if (fileType === FileType.TaskImage) {
      const taskFileRootFolder = await this.getOrCreateTaskFileRootFolder(user.id);
      // eslint-disable-next-line no-param-reassign
      requestedFolderId = taskFileRootFolder.id;
    }

    const requestedFolder: File = requestedFolderId ? await this.findById(requestedFolderId) : null;
    const rootFolder = await this.getRootFolderByUser(user.id);

    const hasRootFolder = Boolean(rootFolder);
    const hasRequestedFolder = Boolean(requestedFolder);

    const isUserRootFolderIsSameAsRequestedFolder =
      hasRootFolder && hasRequestedFolder && rootFolder.id === requestedFolder.id;

    let destFileName;

    if (!hasRootFolder) {
      destFileName = fileName;
    }

    if (hasRootFolder && !hasRequestedFolder) {
      destFileName = `${rootFolder.displayName}/${fileName}`;
    }

    if (isUserRootFolderIsSameAsRequestedFolder) {
      destFileName = `${rootFolder.displayName}/${fileName}`;
    }

    if (hasRootFolder && hasRequestedFolder && !isUserRootFolderIsSameAsRequestedFolder) {
      destFileName = `${rootFolder.displayName}/${requestedFolder.displayName}/${fileName}`;
    }

    await CloudStorageService.uploadFile({
      content,
      destFileName,
      isPublicFile:
        fileType === FileType.RelayPointImage || fileType === FileType.CategoryIcon || fileType === FileType.TaskImage,
    });

    return this.save({
      input: {
        displayName,
        fileName,
        fileType,
        parentFolderId: requestedFolderId ?? rootFolder.id,
        userId: user.id,
      },
    });
  }

  public async uploadStripeInvoiceIntoUserInvoicesFolder(invoice: Stripe.Invoice, userId: string): Promise<File> {
    const invoicesRootFolder = await this.getInvoicesRootFolderByUser(userId);
    const user = await UserService.findById(userId);

    const invoiceNumber = invoice.number;
    const invoiceDate = invoice.created;
    const invoiceAmount = invoice.total;
    const invoiceCurrency = invoice.currency;

    const fileName = `${invoiceNumber}-${invoiceDate}-${invoiceAmount}-${invoiceCurrency}.pdf`;

    const response = await fetch(invoice.invoice_pdf as string);
    const pdfBuffer = await response.arrayBuffer();

    const file = await this.createAndUploadFile({
      content: Buffer.from(pdfBuffer),
      displayName: fileName,
      fileType: FileType.Invoice,
      requestedFolderId: invoicesRootFolder.id,
      user,
    });

    await NotificationService.save({
      input: {
        title: NotificationType.InvoiceAdded,
        type: NotificationType.InvoiceAdded,
        userId: user.id,
      },
    });

    return file;
  }
}

export default new FileService();
