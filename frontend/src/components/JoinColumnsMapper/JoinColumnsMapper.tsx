import React, { FunctionComponent } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { ColumnList } from '../../types/sources';
import { formatString, sortObjectArrayByProperty } from '../../utils';

interface JoinColumnsMapperProps {
  primaryColumns: DropdownItemProps[];
  secondaryColumns: ColumnList;
  primaryColumn: string;
  secondaryColumn: string;
  columnMapping: { [key: string]: string };
  editable?: boolean;
  onUpdate?: (columnMapping: { [key: string]: string }) => void;
  onDelete?: (columnMapping: { [key: string]: string }) => void;
}

const StyledCol = styled(Col)`
  text-align: center;
  margin: auto;
`;

export const JoinColumnsMapper: FunctionComponent<JoinColumnsMapperProps> = (props) => {
  const getSelectOptionsFromColumns = (columns: ColumnList): DropdownItemProps[] => {
    if (columns.count()) {
      return columns
        .map((column) => ({
          key: column.get('id'),
          text: formatString(column.get('name') as string),
          value: column.get('name'),
        }))
        .toJS();
    }

    return [];
  };

  const onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    if (data.value && props.onUpdate) {
      let primaryColumn =
        data.name === 'primaryColumn' ? (data.value as string) : props.primaryColumn;
      let secondaryColumn =
        data.name === 'secondaryColumn' ? (data.value as string) : props.secondaryColumn;
      if (data.name === 'primaryColumn') {
        const matchingColumn = props.secondaryColumns.find(
          (column) => column.get('name') === data.value,
        );
        if (matchingColumn) {
          secondaryColumn = matchingColumn.get('name') as string;
        }
      }
      if (data.name === 'secondaryColumn') {
        const matchingColumn = props.primaryColumns.find((column) => column.value === data.value);
        if (matchingColumn) {
          primaryColumn = matchingColumn.value as string;
        }
      }
      const { columnMapping } = props;
      if (columnMapping.hasOwnProperty(props.primaryColumn)) {
        delete columnMapping[props.primaryColumn];
      }
      props.onUpdate({ ...columnMapping, [primaryColumn]: secondaryColumn });
    }
  };

  const onDelete = () => {
    if (props.onUpdate) {
      const { columnMapping } = props;
      if (columnMapping.hasOwnProperty(props.primaryColumn)) {
        delete columnMapping[props.primaryColumn];
        props.onUpdate(columnMapping);
      }
    }
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
          defaultValue={props.primaryColumn}
          disabled={!props.editable}
          data-testid="qb-join-primary-column-select"
        />
      </Col>

      <StyledCol md={2}>
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
          defaultValue={props.secondaryColumn}
          disabled={!props.editable}
          data-testid="qb-join-secondary-column-select"
        />
      </Col>

      <Col lg={1}>
        <Button
          variant="link"
          className="btn-just-icon"
          onClick={onDelete}
          data-testid="qb-join-delete-mapping"
        >
          <i className="material-icons">delete</i>
        </Button>
      </Col>
    </Row>
  );
};

JoinColumnsMapper.defaultProps = { editable: true };

export default JoinColumnsMapper;
