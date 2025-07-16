import ENVIRONMENT from './environments';

const IS_DEV_ENVIRONNEMENT: boolean =
  !process.env.NODE_ENV ||
  process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ||
  process.env.NODE_ENV === ENVIRONMENT.TEST;

const IS_TEST_ENVIRONNEMENT: boolean = !process.env.NODE_ENV || process.env.NODE_ENV === ENVIRONMENT.TEST;

export { IS_TEST_ENVIRONNEMENT };

export default IS_DEV_ENVIRONNEMENT;
