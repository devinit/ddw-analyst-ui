const status: { [char: string]: string } = {
  p: 'Pending',
  r: 'Running',
  c: 'Completed',
  e: 'Errored',
  s: 'Skipped',
};

const statusClasses: { [char: string]: string } = {
  p: 'badge-secondary',
  r: 'badge-warning',
  c: 'badge-success',
  e: 'badge-danger',
  s: 'badge-info',
};

export const convertStatus = (statusValue: string): string | undefined => {
  for (const key in status) {
    if (key === statusValue) {
      return status[key].toUpperCase();
    }
  }
};

export const getStatusClasses = (statusValue: string): string | undefined => {
  for (const key in statusClasses) {
    if (key === statusValue) {
      return statusClasses[key];
    }
  }
};
