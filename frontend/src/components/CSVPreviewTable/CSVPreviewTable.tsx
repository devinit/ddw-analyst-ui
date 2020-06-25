import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { Column, getDataType } from '../FileInput';

interface ComponentProps {
  columns: Column[];
  data: (string | number)[][];
}

const StyledCardBody = styled(Card.Body)`
  overflow-y: scroll;
  max-height: 400px;
`;

const renderTableHeads = (columns: Column[]): ReactNode =>
  [
    <th className="text-center" key="counter">
      #
    </th>,
  ].concat(
    columns.map(({ name, dataType, hasError }) => (
      <th key={name.split(' ').join('').toLowerCase()}>
        <i className={`material-icons text-${hasError ? 'warning' : 'success'}`} data-notify="icon">
          {hasError ? 'warning' : 'done'}
        </i>{' '}
        {name} <span className="text-muted">({dataType})</span>
      </th>
    )),
  );

const renderTableRows = (data: (string | number)[][], columns: Column[]): ReactNode =>
  data.map((row, index) => (
    <tr key={`${index}`}>
      {[
        <td className="text-center" key="counter">
          {index + 1}
        </td>,
      ].concat(
        row.map((item, columnIndex) => {
          const columnDataType = columns[columnIndex].dataType;

          return (
            <td
              key={`${columnIndex}`}
              className={classNames({ 'table-warning': getDataType(item) !== columnDataType })}
            >
              {item}
            </td>
          );
        }),
      )}
    </tr>
  ));

const CSVPreviewTable: FunctionComponent<ComponentProps> = ({ columns, data }) => {
  return (
    <Card className="card-plain mt-0 mb-0">
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-warning material-icons" data-notify="icon">
          warning
        </i>
        <p>Please make sure that your data has been interpreted correctly.</p>
        <p>
          A <b className="text-warning">warning</b> icon indicates that a column has cells that may
          have missing or invalid data. Such cells are highlighted
        </p>
      </Alert>

      <Card.Header>
        <Card.Title>Preview</Card.Title>
      </Card.Header>

      <StyledCardBody>
        <Table responsive striped>
          <thead>
            <tr>{renderTableHeads(columns)}</tr>
          </thead>
          <tbody>{renderTableRows(data, columns)}</tbody>
        </Table>
      </StyledCardBody>
    </Card>
  );
};

export { CSVPreviewTable };
