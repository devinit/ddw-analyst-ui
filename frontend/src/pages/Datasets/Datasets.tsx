import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { List, fromJS } from 'immutable';
import { date, lorem } from 'faker';
import { DatasetsTableCard } from '../../components/DatasetsTableCard';
import { DatasetMap } from '../../types/datasets';

export const Datasets: React.SFC = () => {
  const [ loading, setLoading ] = React.useState(true);
  const [ datasets, setDatasets ] = React.useState(List<DatasetMap>());

  React.useEffect(() => {
    const newDatasets: DatasetMap[] = [];
    for (let i = 0; i < 10; i++) {
      newDatasets.push(fromJS({
        id: `${i}`,
        title: lorem.words(),
        publication: lorem.sentence(),
        releasedAt: date.past()
      }));
    }
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
