import { generateRandomNumber } from './generateRandomNumber';

const VERIFICATION_CODE_LENGTH = 6;

export const generateVerificationCode = (): string =>
  Array.from({ length: VERIFICATION_CODE_LENGTH }, () => generateRandomNumber(10)).join('');
