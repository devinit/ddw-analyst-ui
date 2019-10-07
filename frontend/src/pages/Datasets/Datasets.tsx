import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { List, fromJS } from 'immutable';
import { DatasetsTableCard } from '../../components/DatasetsTableCard';
import { DatasetMap } from '../../types/datasets';

export const Datasets: React.SFC = () => {
  const [ loading, setLoading ] = React.useState(true);
  const [ datasets, setDatasets ] = React.useState(List<DatasetMap>());

  React.useEffect(() => {
    const newDatasets: DatasetMap[] = [
      fromJS({
        title: 'Dataset 1',
        publication: 'My first dataset',
        releasedAt: new Date()
      }),
      fromJS({
        title: 'Dataset 2',
        publication: 'My second dataset',
        releasedAt: new Date()
      })
    ];
    setDatasets(List(newDatasets));
    setLoading(false);
  }, []);

  return (
    <Row>
      <Col>
        <DatasetsTableCard loading={ loading } datasets={ datasets }/>
      </Col>
    </Row>
  );
};

export { Datasets as default };
