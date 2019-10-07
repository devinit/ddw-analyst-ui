import * as React from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { DatasetList } from '../../types/datasets';
import { DatasetTable } from '../DatasetTable';

interface ComponentProps {
  loading: boolean;
  datasets: DatasetList;
}

export const DatasetsTableCard: React.SFC<ComponentProps> = props => {
  const onRowClick = () => {
    console.log('Clicked'); //tslint:disable-line
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
          <DatasetTable datasets={ props.datasets } onRowClick={ onRowClick }/>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export { DatasetsTableCard as default };
