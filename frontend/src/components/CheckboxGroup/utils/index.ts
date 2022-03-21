import { CheckboxGroupOption } from '..';

export const groupIntoRows = (
  options: CheckboxGroupOption[],
  maxPerRow = 3,
): CheckboxGroupOption[][] => {
  const rows: CheckboxGroupOption[][] = [];
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
