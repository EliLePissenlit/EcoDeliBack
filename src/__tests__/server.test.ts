import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

describe('Apollo Server Tests', () => {
  const app = 'http://localhost:4000';
  const graphqlEndpoint = '/graphql';
  const apiReferenceEndpoint = '/api-reference';

  it('should start the Apollo Server and respond to a simple query', async () => {
    const response = await request(app)
      .post(graphqlEndpoint)
      .send({
        query: `
          query {
            __typename
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('__typename');
    expect(response.body.errors).toBeUndefined();
  });

  it('should serve static files in dev environment', async () => {
    if (process.env.NODE_ENV === 'development') {
      const response = await request(app).get(apiReferenceEndpoint);
      expect(response.status).toBe(200);
    } else {
      expect(true).toBe(true);
    }
  });

  it('should handle GraphQL errors correctly', async () => {
    const response = await request(app)
      .post(graphqlEndpoint)
      .send({
        query: `
          query {
            invalidQuery
          }
        `,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('Cannot query field');
  });
});
