import React, { FunctionComponent, useState } from 'react';
import { AdvancedQueryBuilderAction } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { DataSourceSelector } from '../DataSourceSelector';
import { QueryBuilderActionSelector } from '../QueryBuilderActionSelector';

const QuerySentenceBuilder: FunctionComponent = () => {
  const [source, setSource] = useState<SourceMap>();
  const [action, setAction] = useState<AdvancedQueryBuilderAction>();

  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);
  const onSelectAction = (selectedAction: AdvancedQueryBuilderAction) => setAction(selectedAction);
  console.log(action);

  return (
    <div>
      <DataSourceSelector source={source} onSelect={onSelectSource} />
      <QueryBuilderActionSelector onSelectAction={onSelectAction} />
      {action === 'select' ? <AdvancedSelectQueryBuilder /> : null}
    </div>
  );
};

export { QuerySentenceBuilder };
