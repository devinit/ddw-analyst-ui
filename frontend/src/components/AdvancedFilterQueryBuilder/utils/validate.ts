import CodeMirror from 'codemirror';
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

const widgets: any[] = [];

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

  return validationErrors;
};

export const clearErrors = (): void => {
  for (let index = 0; index < widgets.length; index++) {
    widgets[index].clear();
  }
};

export const validateOperators = (content: EditorContent): string[] => {
  const messages: string[] = [];
  fromJS(content).map((filterComps: any) => {
    return filterComps.map((filters: any) => {
      if (!comp.includes(filters.get('comp'))) {
        messages.push(
          `The operator ${filters.get('comp')} with column name ${filters.get(
            'column',
          )} is invalid.`,
        );
      }
    });
  });

  return messages.length > 0 ? messages : [];
};

export const validateColumns = (content: EditorContent, columns: DropdownItemProps[]): string[] => {
  let selectedColumns: string[] = [];
  const allColumns: string[] = [];
  fromJS(content).map((filterComps: any) => {
    return filterComps.map((filters: any) => {
      selectedColumns.push(filters.get('column'));
    });
  });

  for (let key = 0; key < columns.length; key++) {
    allColumns.push(columns[key].value as string);
  }

  selectedColumns = selectedColumns
    .filter((column) => {
      return !allColumns.includes(column);
    })
    .map((column) => {
      return `${column} is not a valid column name.`;
    });

  return selectedColumns;
};
