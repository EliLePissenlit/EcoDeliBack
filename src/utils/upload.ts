import path from 'path';

import { FileUpload } from 'graphql-upload';

export interface StreamToBufferResult {
  content: Buffer;
  fileExtension: string;
  fileName: string;
}

interface FileInfo {
  fileExtension: string;
  fileName: string;
}

const getFileInfo = async (file: FileUpload): Promise<FileInfo> => {
  const { filename } = await file;
  const fileExtension = path.extname(filename);
  return { fileExtension, fileName: filename };
};

const streamToBuffer = async (file: FileUpload): Promise<StreamToBufferResult> => {
  const { fileExtension, fileName } = await getFileInfo(file);
  const { createReadStream } = await file;
  const readStream = createReadStream();
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    readStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    readStream.once('end', () => {
      resolve({
        content: Buffer.concat(chunks),
        fileExtension,
        fileName,
      });
    });

    readStream.on('error', (error) => {
      reject(error);
    });
  });
};

export { streamToBuffer, getFileInfo };
