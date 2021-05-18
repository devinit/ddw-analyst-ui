import React, { createContext, FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { CodeMirrorReact, JsonModeSpec } from '../CodeMirrorReact';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';

interface QueryContextProps {
  options: AdvancedQueryOptions;
  updateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
}

const mode: CodeMirror.ModeSpec<JsonModeSpec> = { name: 'javascript', json: true };
const defaultOptions: Partial<AdvancedQueryOptions> = { source: undefined, columns: [] };
export const AdvancedQueryContext = createContext<QueryContextProps>({
  options: defaultOptions as AdvancedQueryOptions,
});

const QuerySentenceBuilder: FunctionComponent = () => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();
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

  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);
  const onChange = (value: string) => {
    setContext({
      options: { ...context.options, ...JSON.parse(value) },
      updateOptions: onUpdateOptions,
    });
  };

  return (
    <div>
      <AdvancedQueryContext.Provider value={{ ...context, updateOptions: onUpdateOptions }}>
        <DataSourceSelector source={source} onSelect={onSelectSource} />
        {source ? (
          <>
            <QueryBuilderActionSelector onSelectAction={onSelectAction} />
            {action === 'select' ? <AdvancedSelectQueryBuilder source={source} /> : null}
            <CodeMirrorReact
              config={{
                mode,
                value: JSON.stringify(context.options, null, 2),
                lineNumbers: true,
                theme: 'material',
              }}
              onChange={onChange}
            />
          </>
        ) : null}
      </AdvancedQueryContext.Provider>
    </div>
  );
};

export { QuerySentenceBuilder };
