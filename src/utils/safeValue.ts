const isNullOrUndefinedOrNaNOrInfinity = (value: number): boolean =>
  value === undefined || value === null || Number.isNaN(value) || value === Infinity;

const safeValue = (value: number, ifNullValue = 0): number =>
  isNullOrUndefinedOrNaNOrInfinity(value) ? ifNullValue : value;

export default safeValue;
