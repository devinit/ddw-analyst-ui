import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';

interface SelectQueryBuilderProps {
  source: SourceMap;
  columns?: string[];
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateColumns?: (options: string) => void;
}

const SelectQueryBuilder: FunctionComponent<SelectQueryBuilderProps> = (props) => {
  const [selectableColumns, setSelectableColumns] = useState<DropdownItemProps[]>([]);
  useEffect(() => {
    const { source, step, steps } = props;
    const columns = source.get('columns') as ColumnList;
    const selectable = getStepSelectableColumns(step, steps, columns) as Set<string>;
    setSelectableColumns(
      selectable.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectable, columns)
        : [],
    );
  }, []);

  const onChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    event.stopPropagation();
    if (props.onUpdateColumns) {
      props.onUpdateColumns(JSON.stringify({ columns: data.value as string[] }));
    }
  };

  const onSelectAll = () => {
    if (props.onUpdateColumns) {
      const columns = props.source.get('columns') as ColumnList;
      const columnNames = columns.map((column) => column.get('name')).toJS();
      props.onUpdateColumns(JSON.stringify({ columns: columnNames as string[] }));
    }
  };

  const onDeselectAll = () => {
    if (props.onUpdateColumns) {
      props.onUpdateColumns(JSON.stringify({ columns: [] }));
    }
  };

  return (
    <React.Fragment>
      <Form.Group>
        <Form.Label className="bmd-label-floating">Columns</Form.Label>
        <Dropdown
          placeholder="Select Columns"
          fluid
          multiple
          search
          selection
          options={selectableColumns.sort(sortObjectArrayByProperty('text').sort)}
          value={props.columns?.slice()}
          onChange={onChange}
          disabled={!props.editable}
        />
      </Form.Group>
      <Form.Group>
        <Button variant="danger" size="sm" onClick={onSelectAll} hidden={!props.editable}>
          <i className="material-icons mr-1">check_box</i>
          Select All
        </Button>
        <Button variant="danger" size="sm" onClick={onDeselectAll} hidden={!props.editable}>
          <i className="material-icons mr-1">check_box_outline_blank</i>
          Deselect All
        </Button>
      </Form.Group>
    </React.Fragment>
  );
};

SelectQueryBuilder.defaultProps = { editable: true };

export { SelectQueryBuilder };
