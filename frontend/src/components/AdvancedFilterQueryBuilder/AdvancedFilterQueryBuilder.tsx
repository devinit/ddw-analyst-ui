import React, { FunctionComponent, useContext, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { validateFilter } from './utils';
import { handleAnd } from './utils/actions';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const { options, editor } = useContext(AdvancedQueryContext);
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);

  const onInsertAnd = () => {
    if (editor) {
      const validationResponse = validateFilter({ action: '$and', options, editor });
      handleAnd(validationResponse);
    }
  };

  return (
    <div className="mb-3">
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="top"
          data-html="true"
          title={`<i>Inserts</i> config for creating an <strong>AND</strong> filter.</br><strong>NB:</strong> if a filter property already exists, this will be inserted in the current cursor position`}
          onClick={onInsertAnd}
        >
          Insert AND
        </Button>
        <Button variant="danger" size="sm" className="d-one">
          Insert OR
        </Button>
      </ButtonGroup>
    </div>
  );
};

export { AdvancedFilterQueryBuilder };
