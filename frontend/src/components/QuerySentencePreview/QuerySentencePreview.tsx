import classNames from 'classnames';
import CodeMirror from 'codemirror';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Button, Tab, Tabs } from 'react-bootstrap';
import styled from 'styled-components';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryColumn,
  AdvancedQueryOptions,
  OperationMap,
} from '../../types/operations';
import { Column, SourceMap } from '../../types/sources';
import { AdvancedQueryDataPreview } from '../AdvancedQueryDataPreview';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { QuerySentence } from '../QuerySentence';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';
import { resetClauseOptions, validateOptions } from './utils';

interface QuerySentencePreviewProps {
  source: SourceMap;
  action?: AdvancedQueryBuilderAction;
  operation?: OperationMap;
  onEditorInit?: (editor: CodeMirror.Editor) => void;
  onValidUpdate?: (options: AdvancedQueryOptions) => void;
  showConfig?: boolean;
  showQuery?: boolean;
  showData?: boolean;
}

type PreviewOption = 'config' | 'query' | 'data';
const PreviewWrapper = styled.div`
  min-height: 485px;
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

const StyledTabs = styled(Tabs)`
  border-bottom: 2px solid #9c27b0;
  padding-bottom: 0 !important;
  border-radius: 0 !important;

  > .nav-item.active,
  > .nav-item.active:hover,
  > .nav-item.active:focus {
    border-color: #c8271d;
  }
`;

const QuerySentencePreview: FunctionComponent<QuerySentencePreviewProps> = (props) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [previewOption, setPreviewOption] = useState<PreviewOption>('config');
  const [alert, setAlert] = useState<string[]>([]);
  const [validOptions, setValidOptions] = useState<AdvancedQueryOptions>();
  const [editorValue, setEditorValue] = useState('{}');
  const onRadioChange = (data: string) => setPreviewOption(data as PreviewOption);

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

      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      updateOptions!(updatedOptions);

      const validationResponse = validateOptions(updatedOptions, props.source);
      if (validationResponse.length) {
        setAlert(validationResponse);
      } else {
        setAlert([]);
        setValidOptions(updatedOptions);
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
      <StyledTabs
        id="preview"
        activeKey={previewOption}
        onSelect={onRadioChange}
        className="ml-0 mr-0 pl-0 border-danger"
      >
        {props.showConfig ? (
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
        ) : null}
        {props.showQuery ? (
          <Tab eventKey="query" title="Query">
            {previewOption === 'query' && props.operation ? (
              <QuerySentence operation={props.operation} />
            ) : null}
          </Tab>
        ) : null}
        {props.showData ? (
          <Tab eventKey="data" title="Data">
            {previewOption === 'data' ? <AdvancedQueryDataPreview options={validOptions} /> : null}
          </Tab>
        ) : null}
      </StyledTabs>
    </PreviewWrapper>
  );
};

QuerySentencePreview.defaultProps = { showConfig: true, showData: true, showQuery: true };

export { QuerySentencePreview };
