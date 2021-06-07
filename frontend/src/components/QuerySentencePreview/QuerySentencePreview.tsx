import classNames from 'classnames';
import React, { FunctionComponent, useContext, useState } from 'react';
import { OperationMap } from '../../types/operations';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { ICheckData, IRadio } from '../IRadio';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';

interface QuerySentencePreviewProps {
  operation?: OperationMap;
  onEditorInit: (editor: CodeMirror.Editor) => void;
  onEditorUpdate?: (value: string) => void;
}

type PreviewOption = 'config' | 'query';

const QuerySentencePreview: FunctionComponent<QuerySentencePreviewProps> = (props) => {
  const { options } = useContext(AdvancedQueryContext);
  const [previewOption, setPreviewOption] = useState<PreviewOption>('config');
  const onRadioChange = (data: ICheckData) => setPreviewOption(data.value as PreviewOption);

  return (
    <>
      <div className="mb-2">
        <IRadio
          variant="danger"
          id="config"
          name="config"
          label="Show Config"
          onChange={onRadioChange}
          inline
          checked={previewOption === 'config'}
        />
        <IRadio
          variant="danger"
          id="query"
          name="query"
          label="Preview Query"
          onChange={onRadioChange}
          inline
          checked={previewOption === 'query'}
        />
      </div>
      <div className={classNames({ 'd-none': previewOption !== 'config' })}>
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
      </div>
      {previewOption === 'query' && props.operation ? (
        <QuerySentence operation={props.operation} />
      ) : null}
    </>
  );
};

export { QuerySentencePreview };
