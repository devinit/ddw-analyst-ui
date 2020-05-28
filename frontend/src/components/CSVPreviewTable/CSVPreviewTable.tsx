import React, { FunctionComponent, ReactNode } from 'react';
import { Card, Alert, Table } from 'react-bootstrap';
import { Column } from '../FileInput';

interface ComponentProps {
  columns: Column[];
  data: (string | number)[][];
}

const renderTableHeads = (columns: Column[]): ReactNode =>
  [
    <th className="text-center" key="counter">
      #
    </th>,
  ].concat(
    columns.map(({ name, dataType }) => (
      <th key={name.split(' ').join('').toLowerCase()}>
        <i className="text-warning material-icons" data-notify="icon">
          warning
        </i>{' '}
        {name} <span className="text-muted">({dataType})</span>
      </th>
    )),
  );

const renderTableRows = (data: (string | number)[][]): ReactNode =>
  data.map((row, index) => (
    <tr key={`${index}`}>
      {[
        <td className="text-center" key="counter">
          {index + 1}
        </td>,
      ].concat(row.map((item, key) => <td key={`${key}`}>{item}</td>))}
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

      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>{renderTableHeads(columns)}</tr>
          </thead>
          <tbody>{renderTableRows(data)}</tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export { CSVPreviewTable };
