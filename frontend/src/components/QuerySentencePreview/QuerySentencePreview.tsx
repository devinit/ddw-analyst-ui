import classNames from 'classnames';
import CodeMirror from 'codemirror';
import { fromJS } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Button, Tab, Tabs } from 'react-bootstrap';
import styled from 'styled-components';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryColumn,
  AdvancedQueryOptions,
  OperationData,
  OperationDataList,
  OperationMap,
} from '../../types/operations';
import { Column, SourceMap } from '../../types/sources';
import { previewAdvancedDatasetData } from '../../utils/hooks';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { OperationPreview } from '../OperationPreview';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';
import { resetClauseOptions, validateOptions } from './utils';

interface QuerySentencePreviewProps {
  source: SourceMap;
  action?: AdvancedQueryBuilderAction;
  operation?: OperationMap;
  onEditorInit: (editor: CodeMirror.Editor) => void;
  onValidUpdate?: (options: AdvancedQueryOptions) => void;
}

type PreviewOption = 'config' | 'query' | 'data';
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
  const [previewOption, setPreviewOption] = useState<PreviewOption>('config');
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState<string[]>([]);
  const [validOptions, setValidOptions] = useState<AdvancedQueryOptions>();
  const [editorValue, setEditorValue] = useState('{}');
  const onRadioChange = (data: string) => setPreviewOption(data as PreviewOption);

  const fetchPreviewData = (_options: AdvancedQueryOptions) => {
    setDataLoading(true);
    previewAdvancedDatasetData(_options).then((results) => {
      setDataLoading(false);
      if (results.error) {
        setAlert([`Error: ${results.error}`]);
      } else {
        setData(results.data ? results.data.slice(0, 9) : []);
      }
    });
  };

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  useEffect(() => {
    if (previewOption === 'data' && validOptions) {
      fetchPreviewData(validOptions);
    }
  }, [previewOption]);

  useEffect(() => {
    try {
      const parsedValue = JSON.parse(editorValue);
      const updatedOptions: AdvancedQueryOptions = { ...options, ...parsedValue };

      // for aggregate columns, set required groupby config
      const aggregateColumns = options.columns?.filter((col) => col.aggregate);
      if (aggregateColumns?.length) {
        const nonAggregateColumns = options.columns
          ?.filter((col: AdvancedQueryColumn) => !col.aggregate)
          .map((column: Column) => column.name as string);
        if (options.groupby && options.groupby.length && nonAggregateColumns) {
          const groupBy = options.groupby.concat(
            nonAggregateColumns.filter((column) => !options.groupby?.includes(column as string)),
          );
          // check that groupby has been updated before updating to avoid an infinite loop
          if (options.groupby.sort().join(',') !== groupBy.sort().join(',')) {
            updatedOptions.groupby = groupBy;
          }
        } else {
          updatedOptions.groupby = nonAggregateColumns;
        }
      }

      updateOptions!(updatedOptions);

      const validationResponse = validateOptions(updatedOptions, props.source);
      if (validationResponse.length) {
        setAlert(validationResponse);
      } else {
        setAlert([]);
        setValidOptions(updatedOptions);
        if (previewOption === 'data') {
          fetchPreviewData(options);
        }
        if (props.onValidUpdate) props.onValidUpdate(updatedOptions);
      }
    } catch (error) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (
        (error as any).name === 'SyntaxError' &&
        (error as any).message.includes('Unexpected token')
      ) {
        setAlert([`Invalid JSON: ${(error as any).message}`]);
      }
    }
  }, [editorValue]);

  const getEditorValue = () => {
    return JSON.stringify(options || {}, null, 2);
  };

  const onReset = () => {
    updateOptions!(resetClauseOptions(options, props.action), true);
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return (
    <PreviewWrapper>
      <Alert variant="warning" show={!!alert.length} className="mt-2">
        {alert.map((message, index) => (
          <p key={`${index}`}>{message}</p>
        ))}
      </Alert>
      <Tabs id="preview" activeKey={previewOption} onSelect={onRadioChange} className="ml-0 pl-0">
        <Tab eventKey="config" title="Config">
          <EditorWrapper className={classNames({ 'd-none': previewOption !== 'config' })}>
            <ResetButton
              variant="danger"
              size="sm"
              className={classNames({ 'd-none': previewOption !== 'config' })}
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
        </Tab>
        <Tab eventKey="query" title="Query">
          {previewOption === 'query' && props.operation ? (
            <QuerySentence operation={props.operation} />
          ) : null}
        </Tab>
        <Tab eventKey="data" title="Data">
          {previewOption === 'data' ? (
            <OperationPreview
              show
              data={fromJS(data) as OperationDataList}
              onClose={() => true}
              tableOnly
              loading={dataLoading}
            />
          ) : null}
        </Tab>
      </Tabs>
    </PreviewWrapper>
  );
};

export { QuerySentencePreview };
