import React, { FunctionComponent } from 'react';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { ColumnSelector } from '../AdvancedSelectQueryBuilder/ColumnSelector';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedGroupByQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => (
  <div className="mb-3">
    <AdvancedQueryContext.Consumer>
      {({ options }) => (
        <ColumnSelector
          show
          usage="groupby"
          nameOnly
          source={source}
          columns={
            options.groupby
              ? options.groupby.map<AdvancedQueryColumn>((column) => ({ name: column }))
              : []
          }
        />
      )}
    </AdvancedQueryContext.Consumer>
  </div>
);

export { AdvancedGroupByQueryBuilder };
