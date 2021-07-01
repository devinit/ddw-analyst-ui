import CodeMirror, { LineWidget } from 'codemirror';
import { AdvancedQueryOptions, comp } from '../../../types/operations';
import { FilterWith } from '../AdvancedFilterQueryBuilder';
import { JSHINT } from 'jshint';
import './lint.css';
import { EditorContent } from '../FilterWithAndOr';
import { fromJS } from 'immutable';
import { DropdownItemProps } from 'semantic-ui-react';

interface ValidationOptions {
  action: FilterWith;
  options: AdvancedQueryOptions;
  editor: CodeMirror.Editor;
}

export type ValidationResponse = 'invalid' | 'create' | 'update';

const widgets: LineWidget[] = [];

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

export const validate = (
  editor: CodeMirror.Editor,
  editorContent: EditorContent,
  columns: DropdownItemProps[],
): string[] => {
  const validationErrors: string[] = [];
  clearErrors();
  if (editor) {
    editor.operation(function () {
      for (let i = 0; i < widgets.length; ++i) editor.removeLineWidget(widgets[i]);
      widgets.length = 0;
      JSHINT(editor.getValue());
      for (let i = 0; i < JSHINT.errors.length; ++i) {
        const err = JSHINT.errors[i];
        if (!err) continue;
        const msg = document.createElement('div');
        const icon = msg.appendChild(document.createElement('span'));
        icon.innerHTML = 'x';
        icon.className = 'lint-error-icon';
        msg.appendChild(document.createTextNode(err.reason));
        msg.className = 'lint-error';
        widgets.push(
          editor.addLineWidget(err.line - 1, msg, { coverGutter: false, noHScroll: true }),
        );
      }
    });
    const info = editor.getScrollInfo();
    const after = editor.charCoords({ line: editor.getCursor().line + 1, ch: 0 }, 'local').top;
    if (info.top + info.clientHeight < after) editor.scrollTo(null, after - info.clientHeight + 3);
  }
  const operatorErrors: string[] = validateOperators(editorContent);
  const columnErrors: string[] = validateColumns(editorContent, columns);
  const comparisonErrors: string[] = validateAndOr(editorContent);
  if (operatorErrors.length > 0) {
    operatorErrors.map((operatorError: string) => {
      validationErrors.push(operatorError);
    });
  }
  if (columnErrors.length > 0) {
    columnErrors.map((columnError: string) => {
      validationErrors.push(columnError);
    });
  }
  if (comparisonErrors.length > 0) {
    comparisonErrors.map((comparisonError: string) => {
      validationErrors.push(comparisonError);
    });
  }

  return validationErrors;
};

export const clearErrors = (): void => {
  for (let index = 0; index < widgets.length; index++) {
    widgets[index].clear();
  }
};

export const validateOperators = (content: EditorContent): string[] => {
  const messages: string[] = [];
  const parsedContent: [][] = JSON.parse(JSON.stringify(content));

  for (const key in parsedContent) {
    const filter = parsedContent[key];
    for (const index in filter) {
      if (!comp.includes(filter[index]['comp'])) {
        messages.push(`The operator ${filter[index]['comp']} is invalid.`);
      }
    }
  }

  return messages.length > 0 ? messages : [];
};

export const validateColumns = (content: EditorContent, columns: DropdownItemProps[]): string[] => {
  let selectedColumns: string[] = [];
  const allColumns: string[] = [];
  const parsedContent: [][] = JSON.parse(JSON.stringify(content));

  for (const key in parsedContent) {
    const filter = parsedContent[key];
    for (const index in filter) {
      selectedColumns.push(filter[index]['column']);
    }
  }

  for (let key = 0; key < columns.length; key++) {
    allColumns.push(columns[key].value as string);
  }

  selectedColumns = selectedColumns
    .filter((column) => !allColumns.includes(column))
    .map((column) => (column ? `${column} is not a valid column name.` : 'column is required'));

  return selectedColumns;
};

export const validateAndOr = (content: EditorContent): string[] => {
  const validKeys = ['$and', '$or'];
  const invalidKeys: string[] = [];
  fromJS(content).mapKeys((key: string) => {
    if (!validKeys.includes(key)) {
      invalidKeys.push(`${key} is not a valid comparator`);
    }
  });

  return invalidKeys;
};

export const isEditorContentEmpty = (obj: EditorContent): boolean => {
  for (const value of Object.values(obj)) {
    if (value && value.length > 0) {
      return false;
    }
  }

  return true;
};
