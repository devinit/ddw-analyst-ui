import * as localForage from 'localforage';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationDataTableContainer } from '../../components/OperationDataTableContainer';
import { FetchOptions } from '../../types/api';
import { OperationData, OperationMap } from '../../types/operations';
import { api, localForageKeys } from '../../utils';
import { useOperation, useOperationData } from '../../utils/hooks/operations';

interface RouteParams {
  id?: string;
}
type QueryDataProps = RouteComponentProps<RouteParams>;

const QueryData: FunctionComponent<QueryDataProps> = (props) => {
  const { id } = props.match.params;
  const { operation: activeOperation, loading: operationLoading } = useOperation(
    parseInt(id as string),
  ) as { operation: OperationMap; loading: boolean };
  const { data, dataLoading, error, options, setOptions } = useOperationData(
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

  const onPageChange = (payload: FetchOptions) => setOptions({ payload });

  const renderTable = () => {
    if (id && data && (data as OperationData[]).length !== 0 && activeOperation) {
      return (
        <OperationDataTableContainer
          operation={activeOperation}
          id={parseInt(id)}
          list={data as OperationData[]}
          limit={options.payload.limit || 20}
          offset={options.payload.offset || 0}
          count={activeOperation.get('row_count') as number | null}
          fetchData={onPageChange}
        />
      );
    }
    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    return <div>{dataLoading ? 'Loading ...' : 'No results found'}</div>;
  };

  return (
    <Row>
      <Col>
        <Dimmer active={dataLoading || operationLoading} inverted>
          <Loader content="Loading" />
        </Dimmer>

        <Card>
          <Card.Header className="card-header-text card-header-danger">
            <Card.Text>{activeOperation ? activeOperation.get('name') : 'Query Data'}</Card.Text>
            <Form
              action={`${api.routes.EXPORT}${id}/`}
              method="POST"
              data-testid="dataset-data-export-form"
            >
              {token ? <Form.Control type="hidden" name="token" value={token} /> : null}
              <Button type="submit" variant="danger" size="sm" data-testid="dataset-export-button">
                Export to CSV
              </Button>
            </Form>
          </Card.Header>
          <Card.Body>{renderTable()}</Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export { QueryData, QueryData as default };
