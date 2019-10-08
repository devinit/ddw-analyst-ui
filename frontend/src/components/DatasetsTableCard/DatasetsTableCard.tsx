import * as React from 'react';
import { Button, Card, FormControl, Modal } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Dataset, DatasetList, DatasetMap } from '../../types/datasets';
import { DatasetTable } from '../DatasetTable';
import { DatasetTableRow } from '../DatasetTableRow';

interface ComponentProps {
  loading: boolean;
  datasets?: DatasetList;
}

export const DatasetsTableCard: React.SFC<ComponentProps> = props => {
  const [ activeDataset, setActiveDataset ] = React.useState();
  const [ showDetails, setShowDetails ] = React.useState(false);

  const onRowClick = (dataset: DatasetMap) => {
    setShowDetails(true);
    setActiveDataset(dataset);
  };
  const renderDetailButton = (dataset: DatasetMap, index: number) =>
    <React.Fragment>
      <Button
        variant="danger"
        size="sm"
        className="btn-link"
        onClick={ () => onRowClick(dataset) }
        data-testid={ `details-button-${index}` }
      >
        Details
      </Button>
      <Modal
        show={ showDetails && activeDataset.get('id') === dataset.get('id') }
        onHide={ () => setShowDetails(false) }
        dialogClassName="modal-70w"
        data-testid={ `details-modal-${index}` }
      >
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
      </Modal>
    </React.Fragment>;
  const renderTableRows = () => {
    if (props.datasets && props.datasets.size) {
      return props.datasets.map((dataset, index) =>
        <DatasetTableRow key={ index } dataset={ dataset.toJS() as Dataset }>
          { renderDetailButton(dataset, index) }
        </DatasetTableRow>
      );
    }

    return null;
  };
  const renderPagination = () => {
    if (props.datasets && props.datasets.size) {
      return null;
    }

    return <div data-testid="datasets-no-data">No results found</div>;
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
          { renderPagination() }
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export { DatasetsTableCard as default };
