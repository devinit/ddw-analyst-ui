import CodeMirror from 'codemirror';
import { fromJS } from 'immutable';
import React, { createContext, FunctionComponent, useEffect, useState } from 'react';
import {
  AdvancedQueryBuilderAction,
  AdvancedQueryOptions,
  Operation,
  OperationMap,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedFilterQueryBuilder } from '../AdvancedFilterQueryBuilder';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { CodeMirrorReact, JsonModeSpec } from '../CodeMirrorReact';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';

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
const defaultOptions: Partial<AdvancedQueryOptions> = { source: undefined, columns: [] };
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
  const onUpdateOptions = (options: Partial<AdvancedQueryOptions>) => {
    setContext({ options: { ...context.options, ...options }, updateOptions: onUpdateOptions });
  };
  useEffect(() => {
    setContext({
      options: { ...context.options, source: source?.get('id') as number, columns: [] },
    });
  }, [source]);

  const onEditorInit = (_editor: CodeMirror.Editor) => setEditor(_editor);
  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);
  const onChange = (value: string) => {
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
            <CodeMirrorReact
              config={{
                mode: jsonMode,
                value: JSON.stringify(context.options, null, 2),
                lineNumbers: true,
                theme: 'material',
              }}
              onInit={onEditorInit}
              onChange={onChange}
            />
          </>
        ) : null}
      </AdvancedQueryContext.Provider>
    </div>
  );
};

export { QuerySentenceBuilder };
