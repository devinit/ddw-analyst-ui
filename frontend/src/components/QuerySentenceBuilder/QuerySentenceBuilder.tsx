import React, { FunctionComponent, useState } from 'react';
import { AdvancedQueryBuilderAction } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { CodeMirrorReact, JsonModeSpec } from '../CodeMirrorReact';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';

const mode: CodeMirror.ModeSpec<JsonModeSpec> = { name: 'javascript', json: true };

const QuerySentenceBuilder: FunctionComponent = () => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();

  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);

  const defaultValue = { mode: 'JSON' };

  return (
    <div>
      <DataSourceSelector source={source} onSelect={onSelectSource} />
      <QueryBuilderActionSelector onSelectAction={onSelectAction} />
      {action === 'select' ? <AdvancedSelectQueryBuilder /> : null}
      <CodeMirrorReact config={{ mode, value: JSON.stringify(defaultValue, null, 2) }} />
    </div>
  );
};

export { QuerySentenceBuilder };
