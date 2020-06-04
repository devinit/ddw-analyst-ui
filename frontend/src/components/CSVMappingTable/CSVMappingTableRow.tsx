import React, { FunctionComponent, useContext } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { ColumnList } from '../../types/sources';
import { getSelectOptionsFromColumns } from '../../utils';
import { Column } from '../FileInput';
import { disableSelectedColumns } from './utils';

interface ComponentProps {
  column: Column;
  dataSourceColumns: ColumnList;
}

const CSVMappingTableRow: FunctionComponent<ComponentProps> = ({ column, dataSourceColumns }) => {
  const { data } = useContext(WizardContext);

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
              getSelectOptionsFromColumns(dataSourceColumns),
              data.columns,
            )}
            defaultValue={
              column.dataSourceProperty && (column.dataSourceProperty.get('name') as string)
            }
          />
        ) : null}
      </td>
    </tr>
  );
};

export { CSVMappingTableRow };
