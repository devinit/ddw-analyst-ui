const intervalType: { [char: string]: string } = {
  min: 'Minutes',
  sec: 'Seconds',
  hrs: 'Hours',
  dys: 'Days',
  wks: 'Weeks',
  mnt: 'Months',
  yrs: 'Years',
};

export const convertIntervalType = (value: string): string | undefined => {
  for (const key in intervalType) {
    if (key === value) {
      return intervalType[key];
    }
  }
};
