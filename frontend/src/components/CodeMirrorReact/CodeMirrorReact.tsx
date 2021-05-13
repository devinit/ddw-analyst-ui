import React, { FunctionComponent, useEffect, useRef } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const codeMirror = CodeMirror(ref.current, props.config);
      console.log(codeMirror);
    }
  }, []);

  return <div ref={ref}></div>;
};

export { CodeMirrorReact };
