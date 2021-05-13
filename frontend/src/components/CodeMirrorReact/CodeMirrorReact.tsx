import React, { FunctionComponent, useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

const CodeMirrorReact: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const codeMirror = CodeMirror(ref.current, {
        value: JSON.stringify({ mode: 'JSON' }, null, 4),
        mode: 'json',
        lineNumbers: true,
      });
      console.log(codeMirror);
    }
  });

  return <div ref={ref}></div>;
};

export { CodeMirrorReact };
