import CodeMirror from 'codemirror';
import { fromJS } from 'immutable';
import React, { createContext, FunctionComponent, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryOptions,
  Operation,
  OperationMap,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedFilterQueryBuilder } from '../AdvancedFilterQueryBuilder';
import { AdvancedGroupByQueryBuilder } from '../AdvancedGroupByQueryBuilder';
import { AdvancedJoinQueryBuilder } from '../AdvancedJoinQueryBuilder';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { JsonModeSpec } from '../CodeMirrorReact';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';
import { QuerySentencePreview } from '../QuerySentencePreview';

interface ComponentProps {
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}
export interface QueryContextProps {
  options: AdvancedQueryOptions;
  updateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  editor?: CodeMirror.Editor;
}

export const jsonMode: CodeMirror.ModeSpec<JsonModeSpec> = { name: 'javascript', json: true };
const defaultOptions: Partial<AdvancedQueryOptions> = {
  source: undefined,
  columns: [],
  selectall: true,
};
export const AdvancedQueryContext = createContext<QueryContextProps>({
  options: defaultOptions as AdvancedQueryOptions,
});

const QuerySentenceBuilder: FunctionComponent<ComponentProps> = (props) => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();
  const [editor, setEditor] = useState<CodeMirror.Editor>();
  const [context, setContext] = useState<QueryContextProps>({
    options: defaultOptions as AdvancedQueryOptions,
  });
  const [alert, setAlert] = useState('');
  useEffect(() => {
    setContext({
      options: { ...context.options, source: source?.get('id') as number, columns: [] },
    });
  }, [source]);

  const onUpdateOptions = (options: Partial<AdvancedQueryOptions>) => {
    setContext({ options: { ...context.options, ...options }, updateOptions: onUpdateOptions });
  };
  const onEditorInit = (_editor: CodeMirror.Editor) => setEditor(_editor);
  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);
  const onChange = (value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setContext({
        options: { ...context.options, ...parsedValue },
        updateOptions: onUpdateOptions,
      });
      if (props.operation) {
        props.onUpdateOperation(
          props.operation.set('advanced_config' as keyof Operation, parsedValue),
        );
      } else {
        const operation = fromJS({ advanced_config: parsedValue });
        props.onUpdateOperation(operation);
      }
      setAlert('');
    } catch (error) {
      if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
        setAlert(`Invalid JSON: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <AdvancedQueryContext.Provider value={{ ...context, updateOptions: onUpdateOptions, editor }}>
        <DataSourceSelector source={source} onSelect={onSelectSource} />
        {source ? (
          <>
            <QueryBuilderActionSelector onSelectAction={onSelectAction} />
            {action === 'select' ? <AdvancedSelectQueryBuilder source={source} /> : null}
            {action === 'filter' ? <AdvancedFilterQueryBuilder source={source} /> : null}
            {action === 'join' ? <AdvancedJoinQueryBuilder source={source} /> : null}
            {action === 'groupby' ? <AdvancedGroupByQueryBuilder source={source} /> : null}
            <QuerySentencePreview
              operation={props.operation}
              onEditorInit={onEditorInit}
              onEditorUpdate={onChange}
              action={action}
            />

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
