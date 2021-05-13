import React, { FunctionComponent, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

// interface ComponentProps {}

const AdvancedSelectQueryBuilder: FunctionComponent = () => {
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
    </div>
  );
};

export { AdvancedSelectQueryBuilder };
