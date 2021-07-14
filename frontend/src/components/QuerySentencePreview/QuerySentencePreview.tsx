import classNames from 'classnames';
import CodeMirror from 'codemirror';
import { fromJS } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import styled from 'styled-components';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryOptions,
  OperationData,
  OperationMap,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { previewAdvancedDatasetData } from '../../utils/hooks';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { ICheckData, IRadio } from '../IRadio';
import { OperationPreview } from '../OperationPreview';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';
import { getClauseOptions, resetClauseOptions, validateOptions } from './utils';

interface QuerySentencePreviewProps {
  source: SourceMap;
  action?: AdvancedQueryBuilderAction;
  operation?: OperationMap;
  onEditorInit: (editor: CodeMirror.Editor) => void;
  onValidUpdate?: (options: AdvancedQueryOptions) => void;
}

type PreviewOption = 'clause-config' | 'config' | 'query' | 'data';
const PreviewWrapper = styled.div`
  min-height: 350px;
`;
const ResetButton = styled(Button)`
  position: absolute;
  top: 4px;
  z-index: 10;
  padding-top: 5px;
  padding-bottom: 5px;
  margin-bottom: 0;
  margin-left: 0;
  right: 11px;
`;
const EditorWrapper = styled.div`
  position: relative;
`;

const QuerySentencePreview: FunctionComponent<QuerySentencePreviewProps> = (props) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [previewOption, setPreviewOption] = useState<PreviewOption>('clause-config');
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState<string[]>([]);
  const [validOptions, setValidOptions] = useState<AdvancedQueryOptions>();
  const [editorValue, setEditorValue] = useState('{}');
  const onRadioChange = (data: ICheckData) => setPreviewOption(data.value as PreviewOption);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  useEffect(() => {
    if (previewOption === 'data' && validOptions) {
      setDataLoading(true);
      previewAdvancedDatasetData(validOptions).then((results) => {
        setDataLoading(false);
        if (results.error) {
          setAlert([`Error: ${results.error}`]);
        } else {
          setData(results.data ? results.data.slice(0, 9) : []);
        }
      });
    }
  }, [previewOption]);

  useEffect(() => {
    // every options update is validated. Valid options automatically get saved & are eligible for query & data preview
    const validationResponse = validateOptions(options, props.source);
    if (validationResponse.length) {
      setAlert(validationResponse);
    } else {
      setAlert([]);
      setValidOptions(options);
      if (props.onValidUpdate) props.onValidUpdate(options);
    }
  }, [options]);

  useEffect(() => {
    try {
      const parsedValue = JSON.parse(editorValue);
      updateOptions!({ ...options, ...parsedValue });
      setAlert([]);
    } catch (error) {
      if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        setAlert([`Invalid JSON: ${error.message}`]);
      }
    }
  }, [editorValue]);

  const getEditorValue = () => {
    if (previewOption === 'clause-config') {
      return JSON.stringify(getClauseOptions(options, props.action) || {}, null, 2);
    }

    return JSON.stringify(validOptions || { error: 'Waiting for valid options' }, null, 2);
  };

  const onReset = () => {
    updateOptions!(resetClauseOptions(options, props.action), true);
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return (
    <PreviewWrapper>
      <div className="mb-2">
        <IRadio
          variant="danger"
          id="clause-config"
          name="clause-config"
          label="Clause Config"
          onChange={onRadioChange}
          inline
          checked={previewOption === 'clause-config'}
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
        <IRadio
          variant="danger"
          id="config"
          name="config"
          label="Full Config"
          onChange={onRadioChange}
          inline
          checked={previewOption === 'config'}
        />
      </div>
      <Alert variant="warning" show={!!alert.length} className="mt-2">
        {alert.map((message, index) => (
          <p key={`${index}`}>{message}</p>
        ))}
      </Alert>
      <EditorWrapper
        className={classNames({
          'd-none': previewOption !== 'clause-config' && previewOption !== 'config',
        })}
      >
        <ResetButton
          variant="danger"
          size="sm"
          className={classNames({ 'd-none': previewOption !== 'clause-config' })}
          onClick={onReset}
        >
          Clear
        </ResetButton>
        <CodeMirrorReact
          config={{
            mode: jsonMode,
            value: getEditorValue(),
            lineNumbers: true,
            theme: 'material',
            readOnly: previewOption === 'config',
          }}
          onInit={props.onEditorInit}
          onChange={(value: string) => setEditorValue(value)}
        />
      </EditorWrapper>
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
    </PreviewWrapper>
  );
};

export { QuerySentencePreview };
