import roundDecimals from './roundDecimals';

const centsToEuros = (cents: number): number => roundDecimals(cents / 100, 2);
const eurosToCents = (euros: number): number => roundDecimals(euros * 100, 2);

export { centsToEuros, eurosToCents };
