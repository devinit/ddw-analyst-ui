import CodeMirror, { LineWidget } from 'codemirror';
import { JSHINT } from 'jshint';

const widgets: LineWidget[] = [];

/**
 * validate editor content with JSHINT validator & display errors
 * @param editor - CodeMirror.Editor
 */
export const validateJSHINT = (editor: CodeMirror.Editor): Promise<boolean> =>
  new Promise((resolve) => {
    clearLintingErrors();
    editor.operation(function () {
      widgets.forEach((widget) => editor.removeLineWidget(widget));
      widgets.length = 0;
      JSHINT(editor.getValue());
      // render errors in editor
      JSHINT.errors.forEach((error) => {
        if (!error) return;
        const alert = document.createElement('div');
        alert.classList.add(...['alert', 'alert-danger', 'alert-sm', 'pt-1', 'pb-1']);

        const paragraph = document.createElement('p');
        paragraph.innerHTML = error.reason;
        alert.appendChild(paragraph);
        widgets.push(
          editor.addLineWidget(error.line - 1, alert, { coverGutter: false, noHScroll: true }),
        );
      });

      resolve(!JSHINT.errors.length);
    });
    const info = editor.getScrollInfo();
    const after = editor.charCoords({ line: editor.getCursor().line + 1, ch: 0 }, 'local').top;
    if (info.top + info.clientHeight < after) editor.scrollTo(null, after - info.clientHeight + 3);
  });

export const clearLintingErrors = (): void => {
  for (let index = 0; index < widgets.length; index++) {
    widgets[index].clear();
  }
};
