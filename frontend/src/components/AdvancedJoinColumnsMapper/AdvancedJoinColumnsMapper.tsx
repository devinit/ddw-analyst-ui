import React, { FunctionComponent, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { ColumnList } from '../../types/sources';
import { getSelectOptionsFromColumns, sortObjectArrayByProperty } from '../../utils';

interface JoinColumnsMapperProps {
  primaryColumns: DropdownItemProps[];
  secondaryColumns: ColumnList;
  onAdd?: (columnMapping: [string, string]) => void;
  onRemove?: (columnMapping: [string, string]) => void;
}

const StyledCol = styled(Col)`
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
`;

export const AdvancedJoinColumnsMapper: FunctionComponent<JoinColumnsMapperProps> = (props) => {
  const [selectedColumns, setSelectedColumns] = useState<[string, string]>(['', '']);
  const onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    setSelectedColumns(
      data.name === 'primaryColumn'
        ? [data.value as string, selectedColumns[1]]
        : [selectedColumns[0], data.value as string],
    );
  };

  const onAdd = () => {
    if (props.onAdd) props.onAdd(selectedColumns);
  };

  const onRemove = () => {
    if (props.onRemove) props.onRemove(selectedColumns);
  };

  const { primaryColumns, secondaryColumns } = props;

  return (
    <Row className="mb-1">
      <Col lg={4} className="my-2">
        <Dropdown
          name="primaryColumn"
          placeholder="Select Column"
          fluid
          selection
          search
          options={primaryColumns.sort(sortObjectArrayByProperty('text').sort)}
          onChange={onSelectColumn}
          data-testid="qb-join-primary-column-select"
        />
      </Col>

      <StyledCol md={1}>
        <i className="material-icons">arrow_forward</i>
      </StyledCol>

      <Col lg={4} className="my-2">
        <Dropdown
          name="secondaryColumn"
          placeholder="Select Column"
          fluid
          selection
          search
          options={getSelectOptionsFromColumns(secondaryColumns).sort(
            sortObjectArrayByProperty('text').sort,
          )}
          onChange={onSelectColumn}
          data-testid="qb-join-secondary-column-select"
        />
      </Col>

      <Col lg={2}>
        {props.onAdd ? (
          <Button
            variant="link"
            className="btn-just-icon"
            onClick={onAdd}
            data-testid="qb-join-add-mapping"
          >
            <i className="material-icons">add</i>
          </Button>
        ) : null}
        {props.onRemove ? (
          <Button
            variant="link"
            className="btn-just-icon"
            onClick={onRemove}
            data-testid="qb-join-remove-mapping"
          >
            <i className="material-icons">remove</i>
          </Button>
        ) : null}
      </Col>
    </Row>
  );
};

AdvancedJoinColumnsMapper.defaultProps = {};
