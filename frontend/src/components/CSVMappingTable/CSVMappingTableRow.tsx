import React, { FunctionComponent } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { ColumnList } from '../../types/sources';
import { getSelectOptionsFromColumns } from '../../utils';
import { Column } from '../FileInput';

interface ComponentProps {
  column: Column;
  dataSourceColumns: ColumnList;
}

const CSVMappingTableRow: FunctionComponent<ComponentProps> = ({ column, dataSourceColumns }) => {
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
        <Dropdown
          className="text-capitalize"
          placeholder="Select Data Source"
          fluid
          selection
          options={getSelectOptionsFromColumns(dataSourceColumns)}
          defaultValue="donor-name"
        />
      </td>
    </tr>
  );
};

export { CSVMappingTableRow };
