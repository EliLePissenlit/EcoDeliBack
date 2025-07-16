import archiver from 'archiver';

import { ZipArchive } from '../types/graphql/typeDefs';

interface File {
  name: string;
  content: string | Buffer;
}

const createZipStream = async (files: File[], fileName = 'archive'): Promise<ZipArchive> =>
  new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const base64Content = buffer.toString('base64');
      resolve({
        content: base64Content,
        filename: `${fileName}.zip`,
      });
    });

    for (const file of files) {
      archive.append(file.content, { name: file.name });
    }

    archive.finalize();
  });

export default createZipStream;
