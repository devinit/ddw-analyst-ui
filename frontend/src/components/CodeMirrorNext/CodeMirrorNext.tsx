import { EditorView, ReactCodeMirrorProps, useCodeMirror } from '@uiw/react-codemirror';
import React, { FC, useEffect, useRef } from 'react';

interface CustomProps {
  readOnly?: boolean;
}

type ComponentProps = ReactCodeMirrorProps & CustomProps;

const CodeMirrorNext: FC<ComponentProps> = ({ readOnly, ...props }) => {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer } = useCodeMirror({
    ...props,
    container: editor.current,
    extensions: readOnly
      ? props.extensions
        ? props.extensions.concat(EditorView.editable.of(false))
        : [EditorView.editable.of(false)]
      : props.extensions,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  return <div ref={editor} contentEditable={false} />;
};

export { CodeMirrorNext };
