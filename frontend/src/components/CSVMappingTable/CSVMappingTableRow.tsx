import React, { FunctionComponent } from 'react';
import { Column } from '../FileInput';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

// TODO: Generate options from actual data source columns
const options: DropdownItemProps[] = [
  { key: 'donor-name', text: 'Donor Nane', value: 'donor-name' },
  {
    key: 'destination-project-name',
    text: 'Destination Project Name',
    value: 'destination-project-name',
  },
];

const CSVMappingTableRow: FunctionComponent<{ column: Column }> = ({ column }) => {
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
          options={options}
        />
      </td>
    </tr>
  );
};

export { CSVMappingTableRow };
