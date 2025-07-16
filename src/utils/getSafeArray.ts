const getSafeArray = (value: any): Array<any> => (Array.isArray(value) ? value : [value]);

export default getSafeArray;
