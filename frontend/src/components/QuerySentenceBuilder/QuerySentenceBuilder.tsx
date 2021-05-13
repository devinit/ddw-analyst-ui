import React, { FunctionComponent, useState } from 'react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { CodeMirrorReact, JsonModeSpec } from '../CodeMirrorReact';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';

const mode: CodeMirror.ModeSpec<JsonModeSpec> = { name: 'javascript', json: true };

const getDefaultValue = (source: SourceMap): AdvancedQueryOptions => ({
  source: source.get('id') as number,
  columns: [],
});

const QuerySentenceBuilder: FunctionComponent = () => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();

  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);

  return (
    <div>
      <DataSourceSelector source={source} onSelect={onSelectSource} />
      {source ? (
        <>
          <QueryBuilderActionSelector onSelectAction={onSelectAction} />
          {action === 'select' ? <AdvancedSelectQueryBuilder /> : null}
          <CodeMirrorReact
            config={{
              mode,
              value: JSON.stringify(getDefaultValue(source), null, 2),
              lineNumbers: true,
              theme: 'material',
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export { QuerySentenceBuilder };
