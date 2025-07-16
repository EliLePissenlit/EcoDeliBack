import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    'src/types/graphql/typeDefs.ts': {
      plugins: ['typescript'],
    },
  },
  overwrite: true,
  schema: './src/graphql/**/*.graphql',
};

export default config;
