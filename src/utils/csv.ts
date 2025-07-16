type DataObject = { [key: string]: any };

const arrayToCsv = (data: DataObject[]): string => {
  if (data.length === 0) {
    return '';
  }
  let csv = Object.keys(data[0]).join();
  csv += '\n';
  csv += data
    .map((d) =>
      Object.values(d)
        .map((str) => JSON.stringify(typeof str === 'object' ? str?.id : str))
        .join()
    )
    .join('\n')
    .replace(/(^\[)|(\]$)/gm, '');

  return csv;
};

export { arrayToCsv };
