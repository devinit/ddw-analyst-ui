import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

export type JsonModeSpec = {
  json: boolean;
};

interface CodeMirrorReactProps {
  config: CodeMirror.EditorConfiguration;
}

const CodeMirrorReact: FunctionComponent<CodeMirrorReactProps> = (props) => {
  const [editor, setEditor] = useState<CodeMirror.Editor>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const codeMirror = CodeMirror(ref.current, props.config);
      setEditor(codeMirror);
    }
  }, []);
  useEffect(() => {
    if (editor) {
      const value = editor.getValue();
      editor.setValue((props.config.value as string) || value);
    }
  });

  return <div ref={ref}></div>;
};

export { CodeMirrorReact };
