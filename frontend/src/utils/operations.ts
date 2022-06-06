import { parse, unparse } from 'papaparse';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from './api';

export const fetchOperationCSV = (
  operationId: number,
  fileName: string,
  toastId: number | string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const csvResults: any[] = [];
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
      error: function () {
        toast.update(toastId, { render: 'Error', type: 'error', isLoading: false });
        reject('Error');
      },
      complete: function () {
        toast.update(toastId, {
          render: `Saved ${fileName}.csv`,
          type: 'success',
          isLoading: false,
        });
        saveCSV(unparse(csvResults), fileName);
        resolve('done');
      },
    });
  });
};

const saveCSV = (csvString: string, fileName: string): void => {
  const csvData = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const tempLink = document.createElement('a');
  let csvURL = null;
  const nav = window.navigator as any;
  if (nav.msSaveBlob) {
    csvURL = nav.msSaveBlob(csvData, `${fileName}.csv`);
  } else {
    csvURL = window.URL.createObjectURL(csvData);
  }

  tempLink.href = csvURL;
  tempLink.setAttribute('download', `${fileName}.csv`);
  tempLink.click();
};
