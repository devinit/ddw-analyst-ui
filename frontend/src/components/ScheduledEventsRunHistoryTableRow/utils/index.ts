const status = {
  p: 'Pending',
  r: 'Running',
  c: 'Completed',
  e: 'Errored',
};

const statusClasses = {
  p: 'badge-secondary',
  r: 'badge-warning',
  c: 'badge-success',
  e: 'badge-danger',
};
export const convertStatus = (statusValue: string) => {
  for (const key in status) {
    if (key === statusValue) {
      return status[key].toUpperCase();
    }
  }
};

export const getStatusClasses = (statusValue: string) => {
  for (const key in statusClasses) {
    if (key === statusValue) {
      return statusClasses[key];
    }
  }
};
