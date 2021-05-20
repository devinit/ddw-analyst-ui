import CodeMirror from 'codemirror';
import { AdvancedQueryOptions } from '../../../types/operations';

interface ValidationOptions {
  action: '$and' | '$or';
  options: AdvancedQueryOptions;
  editor: CodeMirror.Editor;
}

export type ValidationResponse = 'invalid' | 'create' | 'update';

export const validateFilter = ({ action, options }: ValidationOptions): ValidationResponse => {
  if (options.filter) {
    // TODO: handle path for existing filters e.g. cursor validation

    return 'update';
  }

  if (action === '$and') {
    // TODO: add filter with an AND option
    return 'create';
  }

  return 'invalid';
};
