import classNames from 'classnames';
import CodeMirror from 'codemirror';
import { fromJS } from 'immutable';
import React, { createContext, FunctionComponent, useEffect, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryOptions,
  AdvancedQueryOptionsMap,
  Operation,
  OperationMap,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedFilterQueryBuilder } from '../AdvancedFilterQueryBuilder';
import { AdvancedGroupByQueryBuilder } from '../AdvancedGroupByQueryBuilder';
import { AdvancedHavingQueryBuilder } from '../AdvancedHavingQueryBuilder';
import { AdvancedJoinQueryBuilder } from '../AdvancedJoinQueryBuilder';
import { AdvancedQueryDataPreview } from '../AdvancedQueryDataPreview';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { JsonModeSpec } from '../CodeMirrorReact';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';
import { QuerySentencePreview } from '../QuerySentencePreview';
import { getCurrentAction } from './utils';

interface ComponentProps {
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
  editable?: boolean;
  source?: SourceMap;
}
export interface QueryContextProps {
  options: AdvancedQueryOptions;
  updateOptions?: (options: Partial<AdvancedQueryOptions>, replace?: boolean) => void;
  editor?: CodeMirror.Editor;
}

export const jsonMode: CodeMirror.ModeSpec<JsonModeSpec> = { name: 'javascript', json: true };
const defaultOptions: Partial<AdvancedQueryOptions> = {
  source: undefined,
  selectall: true,
};
export const AdvancedQueryContext = createContext<QueryContextProps>({
  options: defaultOptions as AdvancedQueryOptions,
});
const StyledRow = styled(Row)`
  background: #fafafa;
  padding-top: 1rem;
`;

const HelperCol = styled(Col)`
  min-height: 485px;
`;

const QuerySentenceBuilder: FunctionComponent<ComponentProps> = (props) => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();
  const [editor, setEditor] = useState<CodeMirror.Editor>();
  const [context, setContext] = useState<QueryContextProps>({
    options: defaultOptions as AdvancedQueryOptions,
  });
  const [alert, setAlert] = useState('');

  useEffect(() => {
    if (props.operation && props.operation.get('is_raw')) {
      props.onUpdateOperation(props.operation.set('is_raw', false));
    }
  }, []);
  useEffect(() => setSource(props.source), [props.source]);
  useEffect(() => {
    const options = { ...context.options };
    if (!props.operation) {
      // clear existing properties (only when NOT editing a dataset)
      options.columns && delete options.columns;
      options.filter && delete options.filter;
      options.groupby && delete options.groupby;
      options.join && delete options.join;
      setContext({
        options: { ...options, source: source?.get('id') as number, selectall: true },
      });
    } else {
      setContext({
        options: { ...options, source: source?.get('id') as number },
      });
    }
  }, [source]);
  useEffect(() => {
    if (props.editable && props.operation) {
      const config = props.operation.get('advanced_config') as AdvancedQueryOptionsMap;
      if (config) {
        setContext({ options: config.toJS() as unknown as AdvancedQueryOptions });
      }
    }
  }, [props.editable]);

  const onUpdateOptions = (options: Partial<AdvancedQueryOptions>, replace?: boolean) => {
    setContext({
      options: replace ? (options as AdvancedQueryOptions) : { ...context.options, ...options },
      updateOptions: onUpdateOptions,
    });
  };
  const onEditorInit = (_editor: CodeMirror.Editor) => setEditor(_editor);
  const onSelectAction = (selectedAction?: AdvancedQueryBuilderAction) => setAction(selectedAction);

  const onUpdate = (options: AdvancedQueryOptions) => {
    if (props.operation) {
      props.onUpdateOperation(
        props.operation.set('advanced_config' as keyof Operation, fromJS(options)),
      );
    } else {
      const operation = fromJS({ advanced_config: options }) as unknown as OperationMap;
      props.onUpdateOperation(operation);
    }
    setAlert('');
  };

  return (
    <div>
      <AdvancedQueryContext.Provider value={{ ...context, updateOptions: onUpdateOptions, editor }}>
        {source ? (
          <>
            <QueryBuilderActionSelector
              onSelectAction={onSelectAction}
              defaultAction={getCurrentAction(props.operation)}
            />
            <StyledRow>
              <HelperCol lg={8}>
                {action === 'select' ? <AdvancedSelectQueryBuilder source={source} /> : null}
                {action === 'filter' ? <AdvancedFilterQueryBuilder source={source} /> : null}
                {action === 'join' ? <AdvancedJoinQueryBuilder source={source} /> : null}
                {action === 'groupby' ? <AdvancedGroupByQueryBuilder source={source} /> : null}
                {action === 'having' ? <AdvancedHavingQueryBuilder source={source} /> : null}
              </HelperCol>
              <Col lg={4} className={classNames('border-left', { 'd-none': !action })}>
                <QuerySentencePreview
                  source={source}
                  action={action}
                  operation={props.operation}
                  onEditorInit={onEditorInit}
                  onValidUpdate={onUpdate}
                  showData={false}
                />
              </Col>
              <Col lg={12}>
                {props.operation ? (
                  <AdvancedQueryDataPreview
                    options={props.operation.get('advanced_config') as AdvancedQueryOptions}
                  />
                ) : null}
              </Col>
            </StyledRow>

            <Alert show={!!alert} variant="warning" className="mt-2">
              {alert}
            </Alert>
          </>
        ) : null}
      </AdvancedQueryContext.Provider>
    </div>
  );
};

export { QuerySentenceBuilder };
