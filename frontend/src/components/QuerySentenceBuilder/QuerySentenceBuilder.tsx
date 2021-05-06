import React, { FunctionComponent, useState } from 'react';
import { SourceMap } from '../../types/sources';
import { DataSourceSelector } from '../DataSourceSelector';

const QuerySentenceBuilder: FunctionComponent = () => {
  const [source, setSource] = useState<SourceMap>();

  const onSelectSource = (selectedSource: SourceMap) => setSource(selectedSource);

  return (
    <div>
      <DataSourceSelector source={source} onSelect={onSelectSource} />
    </div>
  );
};

export { QuerySentenceBuilder };
