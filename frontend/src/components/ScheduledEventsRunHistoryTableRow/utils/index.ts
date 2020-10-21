import { status, statusClasses } from '../../../utils/status';

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
