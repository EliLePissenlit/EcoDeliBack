import crypto from 'crypto';

export const generateRandomNumber = (max: number): number => Math.floor((crypto.randomBytes(1)[0] / 256) * max);
