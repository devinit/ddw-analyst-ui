import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { OperationColumn } from '../../types/sources';
import { OperationDataTable } from '../OperationDataTable';

type ComponentProps = {
  show?: boolean;
  loading?: boolean;
  title?: string;
  data: List<OperationDataMap>;
  onClose: () => void;
  tableOnly?: boolean;
};

const StyledIcon = styled.i`
  cursor: pointer;
`;

const OperationPreview: FunctionComponent<ComponentProps> = ({ show, loading, data, ...props }) => {
  const renderPreview = () => {
    if (loading) {
      return <div>Loading ...</div>;
    }
    if (data.count()) {
      const columns: OperationColumn[] = Object.keys((data.get(0) as OperationDataMap).toJS()).map(
        (column, index) => ({ id: index, column_alias: column, column_name: column }),
      );

      return <OperationDataTable list={data} columns={columns} />;
    }

    return <div>No results found</div>;
  };

  if (props.tableOnly) {
    return <>{show || loading ? renderPreview() : props.children}</>;
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {show || loading ? 'Preview Dataset' : props.title}
          <StyledIcon className="material-icons float-right" onClick={props.onClose}>
            close
          </StyledIcon>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-2">{show || loading ? renderPreview() : props.children}</div>
      </Card.Body>
    </Card>
  );
};

export { OperationPreview };
