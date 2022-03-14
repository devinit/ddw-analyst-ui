import React, { FunctionComponent, useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { ColumnSelector } from '../AdvancedSelectQueryBuilder/ColumnSelector';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedGroupByQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options } = useContext<QueryContextProps>(AdvancedQueryContext);

  if (options.selectall) {
    return <Alert variant="warning">Group By requires you to explicitly select columns</Alert>;
  }

  return (
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
};

export { AdvancedGroupByQueryBuilder };
