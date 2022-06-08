import { parse, unparse } from 'papaparse';
import { api } from './api';

export const exportOperationToCSV = (operationId: number, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const csvResults: unknown[] = [];
    let columns: string[] | undefined;
    parse(`${api.routes.EXPORT}${operationId}/`, {
      step: function (results) {
        csvResults.push(results.data);
        if (!columns) {
          columns = results.meta.fields;
        }
      },
      download: true,
      header: true,
      dynamicTyping: true,
      error: function (error) {
        console.log(error);
        reject(error.message);
      },
      complete: function () {
        saveCSV(unparse(csvResults), fileName);
        resolve('done');
      },
    });
  });
};

const saveCSV = (csvString: string, fileName: string): void => {
  const csvData = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const tempLink = document.createElement('a');
  const csvURL = window.URL.createObjectURL(csvData);

  tempLink.href = csvURL;
  tempLink.setAttribute('download', `${fileName}.csv`);
  tempLink.click();
};
