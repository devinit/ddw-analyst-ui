import classNames from 'classnames';
import CodeMirror from 'codemirror';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { validateJSHINT } from './utils';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

export type JsonModeSpec = {
  json: boolean;
};

interface CodeMirrorReactProps {
  config: CodeMirror.EditorConfiguration;
  onChange?: (value?: string | CodeMirror.Doc) => void;
  onInit?: (editor: CodeMirror.Editor) => void;
  className?: string;
  validateWith?: 'jshint';
}

const getConfig = (
  config: CodeMirror.EditorConfiguration,
  options?: { validate?: boolean },
): CodeMirror.EditorConfiguration => {
  if (options) {
    if (options.validate) {
      return config.gutters ? config : { ...config, gutters: ['CodeMirror-lint-markers'] };
    }
  }

  return config;
};

const CodeMirrorReact: FunctionComponent<CodeMirrorReactProps> = (props) => {
  const [editor, setEditor] = useState<CodeMirror.Editor>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const config = getConfig(props.config, { validate: !!props.validateWith });
      const codeMirror = CodeMirror(ref.current, config);
      setEditor(codeMirror);
      if (props.onInit) props.onInit(codeMirror);
      codeMirror.on('change', (mirror) => {
        if (props.validateWith === 'jshint') {
          validateJSHINT(mirror).then((valid) => {
            if (valid && props.onChange) {
              props.onChange(mirror.getValue());
            }
          });
        } else if (props.onChange) props.onChange(mirror.getValue());
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

  return <div ref={ref} className={classNames(props.className)}></div>;
};

export { CodeMirrorReact };
