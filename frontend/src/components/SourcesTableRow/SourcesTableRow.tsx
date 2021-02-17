import classNames from 'classnames';
import styled from 'styled-components';
import React, { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
export interface SourcesTableRowProps {
  classNames?: string;
  source: SourceMap;
  onShowDatasets: (source: SourceMap) => void;
  onShowMetadata: (source: SourceMap) => void;
  onShowHistory: (source: SourceMap) => void;
}

const StyledTD = styled.td`
  width: 30%;
`;

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
      <StyledTD data-testid="source-table-row-actions">
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
          <Button
            variant="dark"
            size="sm"
            onClick={() => props.onShowHistory(source)}
            data-testid="sources-table-history-button"
          >
            Versions
          </Button>
        </ButtonGroup>
      </StyledTD>
    </tr>
  );
};
