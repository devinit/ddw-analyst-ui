import * as React from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Dataset, DatasetList } from '../../types/datasets';
import { DatasetTable } from '../DatasetTable';
import { DatasetTableRow } from '../DatasetTableRow';

interface ComponentProps {
  loading: boolean;
  datasets: DatasetList;
}

export const DatasetsTableCard: React.SFC<ComponentProps> = props => {
  const onRowClick = () => {
    console.log('Clicked'); //tslint:disable-line
  };
  const renderTableRows = () => {
    if (props.datasets && props.datasets.size) {
      return props.datasets.map((dataset, index) =>
        <DatasetTableRow
          key={ index }
          onClick={ onRowClick }
          dataset={ dataset.toJS() as Dataset }
        >
          <span>Actions Go Here!</span>
        </DatasetTableRow>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <Dimmer active={ props.loading } inverted>
        <Loader content="Loading..." />
      </Dimmer>
      <Card>
        <Card.Header className="card-header-text card-header-danger">
          <Card.Title>
            <FormControl
              placeholder="Search ..."
              className="w-50"
              data-testid="dataset-table-search"
            />
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <DatasetTable>{ renderTableRows() }</DatasetTable>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export { DatasetsTableCard as default };
