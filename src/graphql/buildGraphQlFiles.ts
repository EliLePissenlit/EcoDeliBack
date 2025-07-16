import fs from 'fs';
import path from 'path';

import * as glob from 'glob';

import logger from '../infrastructure/logger';

const srcDir = path.resolve(__dirname, '../../src');
const distDir = path.resolve(__dirname, '../../dist');

const generateGraphQlFiles = () => {
  const graphQlFiles = glob.sync(`${srcDir}/graphql/**/*.graphql`);

  graphQlFiles.forEach((file) => {
    const relativePath = path.relative(`${srcDir}/graphql`, file);
    const distFile = path.resolve(distDir, `graphql/${relativePath}`);

    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    fs.writeFileSync(distFile, fs.readFileSync(file, 'utf8'));
    logger.info(`Copied ${file} to ${distFile}`);
  });
};

generateGraphQlFiles();
