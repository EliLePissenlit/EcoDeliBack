import { describe, expect, it } from '@jest/globals';
import unzip from 'unzipper';

import { ZipArchive } from '../types/graphql/typeDefs';
import { arrayToCsv } from '../utils/csv';
import { centsToEuros, eurosToCents } from '../utils/formatCurrency';
import getSafeArray from '../utils/getSafeArray';
import roundDecimals from '../utils/roundDecimals';
import safeValue from '../utils/safeValue';
import sleep from '../utils/sleep';
import createZipStream from '../utils/zipArchiver';

describe('createZipStream with CSV content', () => {
  it('should create a ZIP archive containing a CSV file', async () => {
    const yesterday = '2024-07-20';
    const rewardsCsvInfos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    const csvContent = arrayToCsv(rewardsCsvInfos);
    const csvFileName = `test_${yesterday}.csv`;
    const csvInfos = [{ content: csvContent, name: csvFileName }];

    const zip: ZipArchive = await createZipStream(csvInfos, `test_${yesterday}`);

    expect(zip.filename).toBe(`test_${yesterday}.zip`);
    expect(zip.content).toBeDefined();
    expect(zip.content.length).toBeGreaterThan(0);

    const extractedFiles: string[] = [];

    await unzip.Open.buffer(Buffer.from(zip.content, 'base64')).then((directory) => {
      directory.files.forEach((file) => {
        extractedFiles.push(file.path);
        file.stream().on('data', (chunk) => {
          const content = chunk.toString();
          if (file.path === csvFileName) {
            expect(content).toBe(csvContent);
          }
        });
      });
    });

    expect(extractedFiles).toContain(csvFileName);
  });
});

describe('safeValue utility function', () => {
  it('should return the provided value if it is a valid number', () => {
    expect(safeValue(5)).toBe(5);
    expect(safeValue(-3)).toBe(-3);
    expect(safeValue(0)).toBe(0);
  });

  it('should return the default value if the input is undefined, null, NaN, or Infinity', () => {
    expect(safeValue(NaN)).toBe(0);
    expect(safeValue(Infinity)).toBe(0);
  });

  it('should return the custom default value if the input is invalid and a custom default is provided', () => {
    expect(safeValue(NaN, 30)).toBe(30);
    expect(safeValue(Infinity, 40)).toBe(40);
  });

  it('should correctly identify null, undefined, NaN, and Infinity', () => {
    expect(safeValue(10)).toBe(10);
    expect(safeValue(-10)).toBe(-10);
    expect(safeValue(NaN)).toBe(0);
    expect(safeValue(Infinity)).toBe(0);
  });
});

describe('sleep function', () => {
  it('should delay execution for the specified number of milliseconds', async () => {
    const start = Date.now();
    const delay = 100;

    await sleep(delay);

    const end = Date.now();
    const elapsed = end - start;

    expect(elapsed).toBeGreaterThanOrEqual(delay);
    expect(elapsed).toBeLessThan(delay + 50);
  });
});

describe('getSafeArray', () => {
  it('should return the input if it is already an array', () => {
    const inputArray = [1, 2, 3];
    const result = getSafeArray(inputArray);

    expect(result).toBe(inputArray);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should wrap a non-array value in an array', () => {
    const inputString = 'hello';
    const result = getSafeArray(inputString);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([inputString]);

    const inputNumber = 42;
    const resultNumber = getSafeArray(inputNumber);

    expect(Array.isArray(resultNumber)).toBe(true);
    expect(resultNumber).toEqual([inputNumber]);
  });

  it('should handle null and undefined correctly', () => {
    const resultNull = getSafeArray(null);
    expect(Array.isArray(resultNull)).toBe(true);
    expect(resultNull).toEqual([null]);

    const resultUndefined = getSafeArray(undefined);
    expect(Array.isArray(resultUndefined)).toBe(true);
    expect(resultUndefined).toEqual([undefined]);
  });

  it('should wrap an object in an array', () => {
    const inputObject = { key: 'value' };
    const result = getSafeArray(inputObject);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([inputObject]);
  });
});

describe('centsToEuros', () => {
  it('should convert cents to euros and round to two decimal places', () => {
    expect(centsToEuros(100)).toBe(1.0);
    expect(centsToEuros(250)).toBe(2.5);
    expect(centsToEuros(999)).toBe(9.99);

    expect(centsToEuros(105)).toBe(1.05);
    expect(centsToEuros(101)).toBe(1.01);
    expect(centsToEuros(333)).toBe(3.33);

    expect(centsToEuros(0)).toBe(0.0);
    expect(centsToEuros(-100)).toBe(-1.0);
  });
});

describe('eurosToCents', () => {
  it('should convert euros to cents and round to two decimal places', () => {
    expect(eurosToCents(1)).toBe(100);
    expect(eurosToCents(2.5)).toBe(250);
    expect(eurosToCents(9.99)).toBe(999);

    expect(eurosToCents(1.05)).toBe(105);
    expect(eurosToCents(1.01)).toBe(101);
    expect(eurosToCents(3.33)).toBe(333);

    expect(eurosToCents(0)).toBe(0);
    expect(eurosToCents(-1)).toBe(-100);
  });
});

describe('roundDecimals', () => {
  it('should round numbers to the specified number of decimal places', () => {
    expect(roundDecimals(1.005, 2)).toBe(1);
    expect(roundDecimals(1.004, 2)).toBe(1.0);
    expect(roundDecimals(10.12345, 3)).toBe(10.123);

    expect(roundDecimals(123.456, 0)).toBe(123);
    expect(roundDecimals(123.5, 0)).toBe(124);

    expect(roundDecimals(0.0004, 4)).toBe(0.0004);
    expect(roundDecimals(0.0004, 3)).toBe(0.0);
    expect(roundDecimals(-123.456, 2)).toBe(-123.46);
  });

  it('should default to rounding to 2 decimal places if no decimals argument is provided', () => {
    expect(roundDecimals(1.004)).toBe(1.0);
    expect(roundDecimals(123.456)).toBe(123.46);
  });

  it('should handle large numbers correctly', () => {
    expect(roundDecimals(123456789.123456, 3)).toBe(123456789.123);
  });

  it('should handle rounding with negative numbers', () => {
    expect(roundDecimals(-1.2345, 3)).toBe(-1.234);
  });

  it('should handle rounding to more than 2 decimal places', () => {
    expect(roundDecimals(1.23456789, 5)).toBe(1.23457);
    expect(roundDecimals(1.234561, 4)).toBe(1.2346);
  });

  it('should return the same number if no rounding is needed', () => {
    expect(roundDecimals(10.0, 2)).toBe(10.0);
    expect(roundDecimals(123.456, 3)).toBe(123.456);
  });
});
