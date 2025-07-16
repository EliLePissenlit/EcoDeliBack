import { FileUpload } from 'graphql-upload';
import FileService from '../../services/files';
import { File, FileType, User } from '../../types/graphql/typeDefs';
import { streamToBuffer } from '../../utils/upload';

class FileWorkflow {
  public static async listFilesInFolder({ folderId, me }: { folderId: string; me: User }): Promise<File[]> {
    const files = await FileService.initializeQuery()
      .where('userId', me.id)
      .where('parentFolderId', folderId)
      .orderBy('created_at', 'desc');

    return files;
  }

  public static async createFolder({
    name,
    me,
    parentFolderId,
  }: {
    name: string;
    me: User;
    parentFolderId?: string | null;
  }): Promise<File> {
    const rootFolder = await FileService.getRootFolderByUser(me.id);

    const folder = await FileService.save({
      input: {
        displayName: name,
        fileName: name,
        fileType: FileType.Folder,
        isFolder: true,
        parentFolderId: parentFolderId ?? rootFolder.id,
        userId: me.id,
      },
    });

    return folder;
  }

  public static async createFiles({
    files,
    me,
    parentFolderId,
  }: {
    files: FileUpload[];
    me: User;
    parentFolderId?: string | null;
  }): Promise<File[]> {
    const filesCreated: File[] = [];

    await Promise.all(
      files.map(async (file) => {
        const { content, fileName } = await streamToBuffer(file);

        const fileCreated = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.Other,
          requestedFolderId: parentFolderId ?? undefined,
          user: me,
        });

        filesCreated.push(fileCreated);
      })
    );

    return filesCreated;
  }

  public static async uploadAvatar({ file, me }: { file: FileUpload; me: User }): Promise<File> {
    const { content, fileName } = await streamToBuffer(file);

    const fileCreated = await FileService.createAvatar({
      content,
      displayName: fileName,
      fileType: FileType.UserAvatar,
      user: me,
    });

    return fileCreated;
  }

  public static async getDownloadUrl(id: string, isPublicUrl?: boolean): Promise<string> {
    const file: File = await FileService.findById(id);
    const downloadUrl = FileService.createDownloadUrl(file, isPublicUrl);

    return downloadUrl;
  }

  public static async listFiles(me: User): Promise<File[]> {
    const rootFolder = await FileService.getRootFolderByUser(me.id);

    const files = await FileService.initializeQuery()
      .where('userId', me.id)
      .where('parentFolderId', rootFolder.id)
      .whereNotIn('fileType', [FileType.UserFolder, FileType.UserAvatarFolder, FileType.UserAvatar])
      .orderBy('created_at', 'desc');

    return files;
  }

  public static async getFileById(id: string): Promise<File> {
    const file = await FileService.findById(id);

    return file;
  }

  public static async getAvatar(id: string): Promise<string | null> {
    const avatar: File = await FileService.initializeQuery()
      .where('fileType', FileType.UserAvatar)
      .andWhere('userId', id)
      .orderBy('createdAt', 'desc')
      .first();

    if (!avatar) return null;

    const avatarDownloadUrl: string = await FileService.createDownloadUrl(avatar, true);

    return avatarDownloadUrl;
  }

  public static async deleteFile(id: string): Promise<boolean> {
    const file = await FileService.findById(id);

    if (file.isFolder) {
      const files = await FileService.initializeQuery().where('parentFolderId', id).orderBy('created_at', 'desc');

      await Promise.all(files.map((f) => FileService.deleteById(f.id)));
    }

    await FileService.deleteById(id);

    return true;
  }
}

export default FileWorkflow;
