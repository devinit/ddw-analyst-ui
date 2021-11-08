import { CheckboxGroupOption } from '..';

export const groupIntoRows = (options: CheckboxGroupOption[]): CheckboxGroupOption[][] => {
  const rows: CheckboxGroupOption[][] = [];
  const maxPerRow = 3;
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    const latestRow = rows[rows.length - 1];
    if (index % maxPerRow && latestRow?.length < maxPerRow) {
      latestRow.push(option);
    } else {
      rows.push([option]);
    }
  }

  return rows;
};
