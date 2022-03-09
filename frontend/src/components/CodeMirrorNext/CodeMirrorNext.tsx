import { EditorView, ReactCodeMirrorProps, useCodeMirror } from '@uiw/react-codemirror';
import React, { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface CustomProps {
  readOnly?: boolean;
}

type ComponentProps = ReactCodeMirrorProps & CustomProps;

const StyledDiv = styled.div<ComponentProps>`
  height: ${(props) => props.height};
`;

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

  return <StyledDiv ref={editor} contentEditable={false} />;
};

CodeMirrorNext.defaultProps = { height: '250px' };

export { CodeMirrorNext };
