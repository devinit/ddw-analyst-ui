export const status: { [char: string]: string } = {
  p: 'Pending',
  r: 'Running',
  c: 'Completed',
  e: 'Errored',
  s: 'Skipped',
};

export const statusClasses: { [char: string]: string } = {
  p: 'badge-secondary',
  r: 'badge-warning',
  c: 'badge-success',
  e: 'badge-danger',
  s: 'badge-info',
};
