/**
 * https://www.papaparse.com/docs
 */
import { parse, ParseConfig } from 'papaparse';

export interface Column {
  name: string;
  dataType: DataType;
}

type DataType = 'text' | 'number'; // TODO: add support for more data types

export interface CSVData {
  columns: Column[];
  data: (string | number)[][];
}

const getDataType = (data: string): DataType => {
  const convertedData = parseFloat(data);

  return isNaN(convertedData) ? 'text' : 'number';
};

const getColumnsFromData = (data: string[][]): Column[] => {
  const titleRow = data[0];

  if (data.length === 1) {
    return titleRow.map((title) => ({ name: title, dataType: 'text' }));
  }

  return titleRow.map((title, index) => {
    const columnData = data[1][index];
    const dataType = getDataType(columnData);

    return { name: title, dataType };
  });
};

export const convertCSVFileToJSON = async (file: File, config?: ParseConfig): Promise<CSVData> => {
  if (file.type !== 'text/csv') {
    throw 'Provided file is not a CSV';
  }

  return new Promise((resolve, reject) => {
    const defaultConfig: ParseConfig = {
      complete: ({ errors, data }) => {
        if (errors && errors.length) {
          reject(errors);
        } else {
          resolve({ columns: getColumnsFromData(data), data: data.splice(1) });
        }
      },
    };
    parse(file, { ...defaultConfig, ...config });
  });
};
