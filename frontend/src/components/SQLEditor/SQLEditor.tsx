import { Completion } from '@codemirror/autocomplete';
import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { fromJS } from 'immutable';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { format } from 'sql-formatter';
import { Operation, OperationData, OperationDataList, OperationMap } from '../../types/operations';
import { Column, ColumnList, SourceMap } from '../../types/sources';
import { getSourceIDFromOperation } from '../../utils';
import { fetchOperationDataPreview } from '../../utils/hooks';
import { CodeMirrorNext } from '../CodeMirrorNext';
import { OperationPreview } from '../OperationPreview';
import { SourcesMetaData } from '../SourcesMetaData';

interface ComponentProps {
  source?: SourceMap;
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}

const getSchema = (table: string, source: SourceMap): { [table: string]: Completion[] } => {
  const columns = (source.get('columns') as ColumnList).toJS() as Column[];

  return {
    [table]: columns.map<Completion>((column) => ({
      label: column.name as string,
      detail: column.alias as string,
      info: column.description as string,
    })),
  };
};

const SQLEditor: FC<ComponentProps> = ({ source, operation, onUpdateOperation }) => {
  const [value, setValue] = useState('');
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (source) {
      const defaultQuery = format(
        `SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`,
        { language: 'postgresql' },
      );
      if (operation) {
        const operationSource = getSourceIDFromOperation(operation);
        // check if the source has been changed
        if (operationSource !== source.get('id')) {
          const updatedOperation = operation
            .set('advanced_config', fromJS({ source: source.get('id') }))
            .set('operation_query', defaultQuery);
          onUpdateOperation(updatedOperation);
          fetchPreviewData(updatedOperation);
          setValue(defaultQuery);

          return;
        } else if (operation.get('operation_query')) {
          setValue(format(operation.get('operation_query') as string, { language: 'postgresql' }));
        } else {
          setValue(defaultQuery);
        }
        if (!operation.get('is_raw')) {
          const updatedOperation = operation.set('is_raw', true);
          onUpdateOperation(updatedOperation);
          fetchPreviewData(updatedOperation);

          return;
        }
        fetchPreviewData(operation);
      } else {
        setValue(defaultQuery);
        onUpdateOperation(
          fromJS({
            is_raw: true,
            operation_query: defaultQuery,
            advanced_config: { source: source.get('id') },
          }) as OperationMap,
        );
      }
    }
  }, [source, operation]);

  const fetchPreviewData = (operation: OperationMap) => {
    if (operation.get('advanced_config') && operation.get('operation_query')) {
      setDataLoading(true);
      fetchOperationDataPreview(operation.toJS() as unknown as Operation, []).then((results) => {
        setDataLoading(false);
        if (results.error) {
          setError(results.error);
        } else {
          setData(results.data ? results.data.slice(0, 9) : []);
        }
      });
    }
  };

  const onChange = (value: string) => setValue(value);
  const onRunQuery = () => {
    if (operation) {
      onUpdateOperation(operation.set('operation_query', value));
    }
  };

  if (!source) return null;

  return (
    <Row>
      <Col lg={9}>
        <Alert variant="warning" show={!!error}>
          {error}
        </Alert>
        <CodeMirrorNext
          value={value}
          extensions={[
            sql({
              dialect: PostgreSQL,
              upperCaseKeywords: true,
              schema: getSchema(`${source.get('active_mirror_name')}`, source),
            }),
          ]}
          onChange={onChange}
        />
        <div className="mt-2">
          <Button variant="dark" onClick={onRunQuery} size="sm">
            <i className="fa fa-play mr-1" /> Run
          </Button>
        </div>
        <OperationPreview
          className="mt-2"
          show
          data={fromJS(data) as OperationDataList}
          onClose={() => true}
          tableOnly
          loading={dataLoading}
        />
      </Col>
      <Col lg={3}>
        <SourcesMetaData />
      </Col>
    </Row>
  );
};

export { SQLEditor };
