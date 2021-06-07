import React, { FunctionComponent, useContext } from 'react';
import { OperationMap } from '../../types/operations';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';

interface QuerySentencePreviewProps {
  operation?: OperationMap;
  onEditorInit: (editor: CodeMirror.Editor) => void;
  onEditorUpdate?: (value: string) => void;
}

const QuerySentencePreview: FunctionComponent<QuerySentencePreviewProps> = (props) => {
  const { options } = useContext(AdvancedQueryContext);

  return (
    <>
      <CodeMirrorReact
        config={{
          mode: jsonMode,
          value: JSON.stringify(options, null, 2),
          lineNumbers: true,
          theme: 'material',
        }}
        onInit={props.onEditorInit}
        onChange={props.onEditorUpdate}
      />
      {props.operation ? <QuerySentence operation={props.operation} /> : null}
    </>
  );
};

export { QuerySentencePreview };
