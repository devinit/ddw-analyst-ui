/**
 * https://www.papaparse.com/docs
 */
import { parse, ParseConfig } from 'papaparse';
import { UpdateTableColumn } from '../../../utils';

export interface Column {
  name: string;
  dataType: DataType;
  hasError?: boolean;
  tableProperty?: UpdateTableColumn;
}

type DataType = 'text' | 'number'; // TODO: add support for more data types

export interface CSVData {
  columns: Column[];
  data: CSVDataOnly;
}

export type CSVDataOnly = (string | number)[][];

export const getDataType = (data: string | number): DataType => {
  if (typeof data === 'number') return 'number';

  const convertedData = parseFloat(data);

  return isNaN(convertedData) ? 'text' : 'number';
};

const validateColumnByDataType = (
  data: string[][],
  columnIndex: number,
  dataType: string,
): boolean => {
  const value = data.find((_data) => getDataType(_data[columnIndex]) !== dataType);

  return !value;
};

const removeBlankRows = (data: string[][]): string[][] =>
  data.filter((row) => !!row.join().replace(' ', ''));

const getColumnsFromData = (data: string[][]): Column[] => {
  const titleRow = data[0];
  const dataOnly = removeBlankRows(data.slice(1));

  if (data.length === 1) {
    return titleRow.map((title) => ({ name: title, dataType: 'text' }));
  }

  return titleRow.map((title, index) => {
    const columnData = dataOnly[0][index];
    const dataType = getDataType(columnData);
    const isValid = validateColumnByDataType(dataOnly, index, dataType);

    return { name: title, dataType, hasError: !isValid };
  });
};

export const convertCSVFileToJSON = async (file: File, config?: ParseConfig): Promise<CSVData> => {
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
