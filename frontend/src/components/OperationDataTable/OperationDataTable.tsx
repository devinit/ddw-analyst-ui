import axios, { AxiosResponse } from 'axios';
import { List } from 'immutable';
import * as localForage from 'localforage';
import React, { FunctionComponent, KeyboardEvent, useState } from 'react';
import { FormControl, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { OperationColumn } from '../../types/sources';
import { api, formatString, localForageKeys } from '../../utils';

interface OperationDataTableProps {
  list: List<OperationDataMap>;
  columns: OperationColumn[];
  editableHeaders?: boolean;
}

const StyledTableHeader = styled.th`
  border-top: 1px solid #ddd !important;
  background-color: #f2f2f2 !important;
  white-space: nowrap !important;
  padding: 5px 8px !important;
  font-size: 0.85rem !important;
  font-weight: 400 !important;
`;

const StyleTableCell = styled.td`
  padding: 4px 8px !important;
`;

const renderTableRows = (data: List<OperationDataMap>, columns: OperationColumn[]) => {
  if (data && columns.length) {
    return data.map((item, key) => (
      <tr key={key}>
        {columns.map((column) => (
          <StyleTableCell key={column.column_name} className="text-truncate">
            {item.get(column.column_name)?.toString()}
          </StyleTableCell>
        ))}
      </tr>
    ));
  }
};

export const OperationDataTable: FunctionComponent<OperationDataTableProps> = ({
  list,
  editableHeaders,
  ...props
}) => {
  const [editableHeader, setEditableHeader] = useState('');
  const [columns, setColumns] = useState(props.columns);
  const onToggleEditingHeader = (column?: OperationColumn): void => {
    setEditableHeader(column ? column.column_name : '');
  };

  const onEditColumnHeader = (event: KeyboardEvent<HTMLInputElement>, column: OperationColumn) => {
    if (event.key.toLowerCase() === 'enter') {
      const alias = event.currentTarget.value;
      localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
        axios
          .request({
            url: `${api.routes.DATASET_ALIAS}${column.id}/`,
            method: 'put',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `token ${token}`,
            },
            data: {
              column_name: column.column_name,
              column_alias: alias,
            },
          })
          .then(({ data }: AxiosResponse<OperationColumn>) => {
            setColumns(
              columns.map((column) => {
                if (column.column_name === data.column_name) {
                  column.column_alias = data.column_alias;
                }

                return column;
              }),
            );
            onToggleEditingHeader();
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  };

  return (
    <Table bordered responsive hover className="operation-data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <StyledTableHeader
              key={column.column_name}
              className="text-truncate"
              onClick={() => onToggleEditingHeader(column)}
            >
              {editableHeaders && editableHeader === column.column_name ? (
                <FormControl
                  type="text"
                  defaultValue={column.column_alias}
                  onKeyPress={(event: KeyboardEvent<HTMLInputElement>) =>
                    onEditColumnHeader(event, column)
                  }
                  autoFocus
                  onBlur={() => onToggleEditingHeader()}
                />
              ) : (
                formatString(column.column_alias)
              )}
            </StyledTableHeader>
          ))}
        </tr>
      </thead>
      <tbody data-testid="dataset-table-body">{renderTableRows(list, columns)}</tbody>
    </Table>
  );
};

OperationDataTable.defaultProps = { columns: [], editableHeaders: false };
