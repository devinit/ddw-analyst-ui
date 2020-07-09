export type RunInstanceStatus = 'e' | 'p' | 'c' | 's';

export const statusMapping: { [x in RunInstanceStatus]: string } = {
  c: 'Complete',
  e: 'Errored',
  p: 'Pending',
  s: 'Skipped',
};
