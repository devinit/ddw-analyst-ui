import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
export interface SourcesTableRowProps {
  classNames?: string;
  source: SourceMap;
  onShowDatasets: (source: SourceMap) => void;
  onShowMetadata: (source: SourceMap) => void;
}

export const SourcesTableRow: FunctionComponent<SourcesTableRowProps> = ({ source, ...props }) => {
  return (
    <tr className={props.classNames} data-testid="sources-table-row">
      <td>
        {source.get('indicator')}
        <span
          className={classNames('text-uppercase', { 'd-none': !source.get('indicator_acronym') })}
        >
          {` (${source.get('indicator_acronym')})`}
        </span>
      </td>
      <td>{new Date(source.get('last_updated_on') as string).toDateString()}</td>
      <td>
        <ButtonGroup>
          <Button
            variant="dark"
            size="sm"
            onClick={() => props.onShowMetadata(source)}
            data-testid="sources-table-metadata-button"
          >
            Metadata
          </Button>
          <Button
            variant="dark"
            size="sm"
            onClick={() => props.onShowDatasets(source)}
            data-testid="sources-table-dataset-button"
          >
            Datasets
          </Button>
        </ButtonGroup>
      </td>
    </tr>
  );
};
