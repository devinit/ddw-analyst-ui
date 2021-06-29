import classNames from 'classnames';
import { fromJS } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { OperationData, OperationMap } from '../../types/operations';
import { previewAdvancedDatasetData } from '../../utils/hooks';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { ICheckData, IRadio } from '../IRadio';
import { OperationPreview } from '../OperationPreview';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';

interface QuerySentencePreviewProps {
  operation?: OperationMap;
  onEditorInit: (editor: CodeMirror.Editor) => void;
  onEditorUpdate?: (value: string) => void;
}

type PreviewOption = 'config' | 'query' | 'data';

const QuerySentencePreview: FunctionComponent<QuerySentencePreviewProps> = (props) => {
  const { options } = useContext(AdvancedQueryContext);
  const [previewOption, setPreviewOption] = useState<PreviewOption>('config');
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState('');
  const onRadioChange = (data: ICheckData) => setPreviewOption(data.value as PreviewOption);

  useEffect(() => {
    if (previewOption === 'data') {
      setDataLoading(true);
      previewAdvancedDatasetData(options).then((results) => {
        setDataLoading(false);
        if (results.error) {
          setAlert(`Error: ${results.error}`);
          console.log(`Error: ${results.error}`);
        } else {
          setData(results.data ? results.data.slice(0, 9) : []);
        }
      });
    }
  }, [previewOption]);

  return (
    <>
      <div className="mb-2">
        <IRadio
          variant="danger"
          id="config"
          name="config"
          label="Full Config"
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
        <IRadio
          variant="danger"
          id="data"
          name="data"
          label="Preview Data"
          onChange={onRadioChange}
          inline
          checked={previewOption === 'data'}
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
      {previewOption === 'data' ? (
        <OperationPreview
          show
          data={fromJS(data)}
          onClose={() => true}
          tableOnly
          loading={dataLoading}
        />
      ) : null}
      <Alert variant="warning" show={!!alert}>
        {alert}
      </Alert>
    </>
  );
};

export { QuerySentencePreview };
