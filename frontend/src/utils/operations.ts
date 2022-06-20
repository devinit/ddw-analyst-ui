import { parse, unparse } from 'papaparse';
import { api } from './api';

export const exportOperationToCSV = (operationId: number, fileName: string): Promise<string> => {
  const exportURL = `${api.routes.EXPORT}${operationId}/`;

  return new Promise((resolve, reject) => {
    const csvResults: unknown[] = [];
    let columns: string[] | undefined;
    parse(exportURL, {
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
        saveCSV(fileName, exportURL);
        reject(error.message);
      },
      complete: function () {
        saveCSV(fileName, createUrlFromCSVString(unparse(csvResults)));
        resolve('done');
      },
    });
  });
};

const saveCSV = (fileName: string, url: string): void => {
  const tempLink = document.createElement('a');
  tempLink.href = url;
  tempLink.setAttribute('download', `${fileName}.csv`);
  tempLink.setAttribute('target', '_blank');
  tempLink.click();
};

const createUrlFromCSVString = (csvString: string): string => {
  const csvData = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  return window.URL.createObjectURL(csvData);
};
