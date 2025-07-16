import { combineResolvers } from 'graphql-resolvers';

import { MutationContactUsArgs } from '../../types/graphql/typeDefs';

import ContactWorkflow from '../../workflows/contacts';

const Mutation = {
  contactUs: combineResolvers(
    async (parent, { input }: MutationContactUsArgs): Promise<boolean> => ContactWorkflow.contactUs(input)
  ),
};

export default {
  Mutation,
};
