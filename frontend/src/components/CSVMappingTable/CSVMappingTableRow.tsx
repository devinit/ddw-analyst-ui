import React, { FunctionComponent, SyntheticEvent, useContext } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { ColumnList } from '../../types/sources';
import { getSelectOptionsFromColumns } from '../../utils';
import { Column } from '../FileInput';
import { disableSelectedColumns } from './utils';

interface ComponentProps {
  column: Column;
  dataSourceColumns: ColumnList;
}

const CSVMappingTableRow: FunctionComponent<ComponentProps> = ({ column, ...props }) => {
  const { data, updateData } = useContext(WizardContext);

  const onChange = (_event: SyntheticEvent<HTMLElement, Event>, selected: DropdownProps): void => {
    if (data && updateData) {
      const property = props.dataSourceColumns.find(
        (column) => column.get('name') === selected.value,
      );
      if (property) {
        const csvColumn = data.columns.find((_column) => _column.name === column.name);
        if (csvColumn) {
          csvColumn.dataSourceProperty = property;
          updateData({ ...data });
        }
      }
    }
  };

  return (
    <tr>
      <td>
        <i
          className={`text-${column.dataSourceProperty ? 'success' : 'danger'} material-icons`}
          data-notify="icon"
        >
          {column.dataSourceProperty ? 'check_circle' : 'clear'}
        </i>
      </td>

      <td>{column.name}</td>

      <td>
        {data ? (
          <Dropdown
            className="text-capitalize"
            placeholder="Select Data Source"
            fluid
            selection
            options={disableSelectedColumns(
              getSelectOptionsFromColumns(props.dataSourceColumns),
              data.columns,
            )}
            value={column.dataSourceProperty && (column.dataSourceProperty.get('name') as string)}
            onChange={onChange}
          />
        ) : null}
      </td>
    </tr>
  );
};

export { CSVMappingTableRow };
