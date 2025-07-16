const ENVIRONMENT: any = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

const CURRENT_ENVIRONMENT: string = process.env.NODE_ENV as string;

export { CURRENT_ENVIRONMENT };

export default ENVIRONMENT;
