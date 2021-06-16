import CodeMirror from 'codemirror';
import { AdvancedQueryOptions } from '../../../types/operations';
import { FilterWith } from '../AdvancedFilterQueryBuilder';
import { JSHINT } from 'jshint';
import './lint.css';

interface ValidationOptions {
  action: FilterWith;
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

export const validate = (editor: CodeMirror.Editor) => {
  const widgets: any[] = [];
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
    // editor.clearHistory();
  }
};
