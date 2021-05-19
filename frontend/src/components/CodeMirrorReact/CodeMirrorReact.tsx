import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

export type JsonModeSpec = {
  json: boolean;
};

interface CodeMirrorReactProps {
  config: CodeMirror.EditorConfiguration;
  onChange?: (value?: string | CodeMirror.Doc) => void;
}

const CodeMirrorReact: FunctionComponent<CodeMirrorReactProps> = (props) => {
  const [editor, setEditor] = useState<CodeMirror.Editor>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const codeMirror = CodeMirror(ref.current, props.config);
      setEditor(codeMirror);
      codeMirror.on('change', (mirror) => {
        if (props.onChange) {
          props.onChange(mirror.getValue());
        }
      });
    }
  }, []);
  useEffect(() => {
    if (editor) {
      const value = editor.getValue();
      if (value !== props.config.value) {
        const cursorPosition = editor.getCursor();
        editor.setValue((props.config.value as string) || value);
        editor.setCursor(cursorPosition);
        editor.focus();
      }
    }
  }, [props.config.value]);

  return <div ref={ref}></div>;
};

export { CodeMirrorReact };
