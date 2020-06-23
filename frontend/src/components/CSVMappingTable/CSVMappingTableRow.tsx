import React, { FunctionComponent, SyntheticEvent, useContext } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { UpdateTableColumn } from '../../utils';
import { Column } from '../FileInput';
import { disableSelectedColumns } from './utils';

interface ComponentProps {
  column: Column;
  tableColumns: UpdateTableColumn[];
}

const CSVMappingTableRow: FunctionComponent<ComponentProps> = ({ column, ...props }) => {
  const { data, updateData } = useContext(WizardContext);

  const onChange = (_event: SyntheticEvent<HTMLElement, Event>, selected: DropdownProps): void => {
    if (data && updateData) {
      const property = props.tableColumns.find((column) => column.name === selected.value);
      if (property) {
        const csvColumn = data.columns.find((_column) => _column.name === column.name);
        if (csvColumn) {
          csvColumn.tableProperty = property;
          updateData({ ...data });
        }
      }
    }
  };

  return (
    <tr>
      <td>
        <i
          className={`text-${column.tableProperty ? 'success' : 'danger'} material-icons`}
          data-notify="icon"
        >
          {column.tableProperty ? 'check_circle' : 'clear'}
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
              props.tableColumns.map(({ name, caption }) => ({ text: caption, value: name })),
              data.columns,
            )}
            value={column.tableProperty && column.tableProperty.name}
            onChange={onChange}
          />
        ) : null}
      </td>
    </tr>
  );
};

export { CSVMappingTableRow };
