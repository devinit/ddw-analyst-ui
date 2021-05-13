import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { ColumnSelector } from './ColumnSelector';
interface ComponentProps {
  source: SourceMap;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);

  return (
    <div className="mb-3">
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="bottom"
          data-html="true"
          title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
          onClick={() => setDisplayColumnSelector(true)}
        >
          Select Column(s)
        </Button>
        <Button variant="danger" size="sm" className="d-none">
          Insert Column
        </Button>
        <Button variant="danger" size="sm" className="d-none">
          Order Columns
        </Button>
      </ButtonGroup>
      <ColumnSelector show={displayColumnSelector} source={source} />
    </div>
  );
};

export { AdvancedSelectQueryBuilder };
