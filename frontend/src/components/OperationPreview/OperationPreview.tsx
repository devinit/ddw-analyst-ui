import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
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
  className?: string;
};

const StyledIcon = styled.i`
  cursor: pointer;
`;
const StyledDiv = styled.div`
  position: relative;
  min-height: 300px;
`;

const OperationPreview: FunctionComponent<ComponentProps> = ({ show, loading, data, ...props }) => {
  const renderPreview = () => {
    if (loading) {
      return (
        <Dimmer inverted active>
          <Loader content="Loading" />
        </Dimmer>
      );
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
    return (
      <StyledDiv className={props.className}>
        {show || loading ? renderPreview() : props.children}
      </StyledDiv>
    );
  }

  return (
    <Card className={props.className}>
      <Card.Header>
        <Card.Title>
          {show || loading ? 'Preview Dataset' : props.title}
          <StyledIcon className="material-icons float-right" onClick={props.onClose}>
            close
          </StyledIcon>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-2 position-relative">
          {show || loading ? renderPreview() : props.children}
        </div>
      </Card.Body>
    </Card>
  );
};

export { OperationPreview };
