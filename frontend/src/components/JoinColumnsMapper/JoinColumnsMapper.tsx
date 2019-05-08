import * as React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { ColumnList } from '../../types/sources';
import { formatString } from '../../utils';

interface JoinColumnsMapperProps {
  primaryColumns: ColumnList;
  secondaryColumns: ColumnList;
  primaryColumn: string;
  secondaryColumn: string;
  columnMapping: { [key: string]: string };
  editable?: boolean;
  onUpdate?: (columnMapping: { [key: string]: string }) => void;
  onDelete?: (columnMapping: { [key: string]: string }) => void;
}

interface JoinColumnsMapperState {
  primaryColumn: string;
  secondaryColumn: string;
}
const StyledCol = styled(Col)`
  text-align: center;
  margin: auto;
`;

export class JoinColumnsMapper extends React.Component<JoinColumnsMapperProps, JoinColumnsMapperState> {
  static defaultProps: Partial<JoinColumnsMapperProps> = { editable: true };
  state: JoinColumnsMapperState = { primaryColumn: '', secondaryColumn: '' };

  render() {
    const { primaryColumns, primaryColumn, secondaryColumns, secondaryColumn } = this.props;

    return (
      <Row className="mb-1">
        <Col lg={ 4 } className="my-2">
          <Dropdown
            name="primaryColumn"
            placeholder="Select Column"
            fluid
            selection
            search
            options={ this.getSelectOptionsFromColumns(primaryColumns) }
            onChange={ this.onSelectColumn }
            defaultValue={ primaryColumn }
            disabled={ !this.props.editable }
          />
        </Col>

        <StyledCol md={ 2 }><i className="material-icons">arrow_forward</i></StyledCol>

        <Col lg={ 4 } className="my-2">
          <Dropdown
            name="secondaryColumn"
            placeholder="Select Column"
            fluid
            selection
            search
            options={ this.getSelectOptionsFromColumns(secondaryColumns) }
            onChange={ this.onSelectColumn }
            defaultValue={ secondaryColumn }
            disabled={ !this.props.editable }
          />
        </Col>

        <Col lg={ 1 }>
          <Button variant="link" className="btn-just-icon" onClick={ this.onDelete }>
            <i className="material-icons">delete</i>
          </Button>
        </Col>
      </Row>
    );
  }

  private getSelectOptionsFromColumns(columns: ColumnList): DropdownItemProps[] {
    if (columns.count()) {
      return columns.map(column => ({
        key: column.get('id'),
        text: formatString(column.get('name') as string),
        value: column.get('name')
      })).toJS();
    }

    return [];
  }

  private onSelectColumn = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (data.value && this.props.onUpdate) {
      const primaryColumn = data.name === 'primaryColumn' ? data.value as string : this.props.primaryColumn;
      const secondaryColumn = data.name === 'secondaryColumn' ? data.value as string : this.props.secondaryColumn;
      const { columnMapping } = this.props;
      if (columnMapping.hasOwnProperty(this.props.primaryColumn)) {
        delete columnMapping[this.props.primaryColumn];
      }
      this.props.onUpdate({ ...columnMapping, [primaryColumn]: secondaryColumn });
    }
  }

  private onDelete = () => {
    if (this.props.onUpdate) {
      const { columnMapping } = this.props;
      if (columnMapping.hasOwnProperty(this.props.primaryColumn)) {
        delete columnMapping[this.props.primaryColumn];
        this.props.onUpdate(columnMapping);
      }
    }
  }
}

export default JoinColumnsMapper;
