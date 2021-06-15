import * as localForage from 'localforage';
import React, { FunctionComponent, Suspense, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { OperationDataTableContainer } from '../../components/OperationDataTableContainer';
import { FetchOptions } from '../../types/api';
import { OperationData, OperationMap } from '../../types/operations';
import { api, localForageKeys } from '../../utils';
import {
  useOperation,
  useOperationData,
  OperationDataReader,
  OperationReader,
} from '../../utils/hooks/operations';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface RouteParams {
  id?: string;
}
type QueryDataProps = RouteComponentProps<RouteParams>;

interface RenderOperationNameParams {
  operationReader: OperationReader;
}

interface RenderDataParams {
  activeOperation: OperationReader;
  id: number;
  useOpData: OperationDataReader;
}

interface RenderDataTableParams {
  activeOperation: OperationMap;
  id: number;
  useOpData: OperationDataReader;
}

const RenderDataTable = (props: RenderDataTableParams) => {
  const id = props.id;
  const activeOperation = props.activeOperation;
  const useOpData = props.useOpData;
  const { data, options, setOptions } = useOpData();
  const onPageChange = (payload: FetchOptions) => setOptions({ payload });

  return (
    <OperationDataTableContainer
      operation={activeOperation}
      id={id}
      list={data as OperationData[]}
      limit={options.payload.limit || 20}
      offset={options.payload.offset || 0}
      count={activeOperation.get('row_count') as number | null}
      fetchData={onPageChange}
    />
  );
};

const RenderData = (props: RenderDataParams) => {
  const id = props.id;
  const { operation: activeOperation } = props.activeOperation() as { operation: OperationMap };
  const useOpData = props.useOpData;

  const estimatedRunTime = activeOperation.get('estimated_run_time') as number;
  const estimatedSeconds = estimatedRunTime === 10 ? 0 : estimatedRunTime / 1000;

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime === 0) {
      return <div className="timer">Results rendering...</div>;
    }

    return (
      <div className="timer-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="timer">
          <div className="text">Remaining</div>
          <div className="value">{remainingTime}</div>
          <div className="text">seconds</div>
        </div>
      </div>
    );
  };

  return (
    <Suspense
      fallback={
        <CountdownCircleTimer
          isPlaying
          duration={estimatedSeconds}
          colors={[
            ['#004777', 0.33],
            ['#F7B801', 0.33],
            ['#A30000', 0.33],
          ]}
        >
          {renderTime}
        </CountdownCircleTimer>
      }
    >
      <RenderDataTable id={id} activeOperation={activeOperation} useOpData={useOpData} />
    </Suspense>
  );
};

const RenderOperationName = (props: RenderOperationNameParams) => {
  const { operation: activeOperation } = props.operationReader() as { operation: OperationMap };

  return <sub>{activeOperation ? activeOperation.get('name') : 'Query Data'}</sub>;
};

const QueryData: FunctionComponent<QueryDataProps> = (props) => {
  const { id } = props.match.params;

  const operationReader = useOperation(parseInt(id as string));

  const useOpData = useOperationData(
    {
      payload: { id: parseInt(id as string), limit: 15, offset: 0 },
    },
    false,
    false,
  );
  const [token, setToken] = useState<string>();

  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((key) => setToken(key || undefined));
  }, []);

  return (
    <Row>
      <Col>
        <Suspense fallback="Loading Operation">
          <Card>
            <Card.Header className="card-header-text card-header-danger">
              <Card.Text>
                <RenderOperationName operationReader={operationReader} />
              </Card.Text>
              <Form
                action={`${api.routes.EXPORT}${id}/`}
                method="POST"
                data-testid="dataset-data-export-form"
              >
                {token ? <Form.Control type="hidden" name="token" value={token} /> : null}
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  data-testid="dataset-export-button"
                >
                  Export to CSV
                </Button>
              </Form>
            </Card.Header>

            <Card.Body>
              <Suspense fallback="Data Loading">
                <RenderData
                  useOpData={useOpData}
                  id={parseInt(id as string)}
                  activeOperation={operationReader}
                />
              </Suspense>
            </Card.Body>
          </Card>
        </Suspense>
      </Col>
    </Row>
  );
};

export { QueryData, QueryData as default };
