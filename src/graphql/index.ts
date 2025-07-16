import path from 'path';

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import IS_DEV_ENVIRONNEMENT from '../shared/isDevEnvironnement';

const typesArray = loadFilesSync(path.join(__dirname, './**/*.graphql'));
const resolversArray = loadFilesSync(
  path.join(__dirname, IS_DEV_ENVIRONNEMENT ? './**/resolvers.ts' : './**/resolvers.js')
);

const typeDefs = mergeTypeDefs(typesArray);
const resolvers = mergeResolvers(resolversArray);

const schema = makeExecutableSchema({ resolvers, typeDefs });

export default schema;
