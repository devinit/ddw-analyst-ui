import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { fromJS } from 'immutable';
import React, { FC, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { format } from 'sql-formatter';
import { Operation, OperationData, OperationDataList, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { getSourceIDFromOperation } from '../../utils';
import { fetchOperationDataPreview } from '../../utils/hooks';
import { CodeMirrorNext } from '../CodeMirrorNext';
import { OperationPreview } from '../OperationPreview';

interface ComponentProps {
  source?: SourceMap;
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}

const SQLEditor: FC<ComponentProps> = ({ source, operation, onUpdateOperation }) => {
  const [value, setValue] = useState('');
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (source && !operation) {
      const defaultQuery = format(
        `SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`,
        { language: 'postgresql' },
      );
      setValue(defaultQuery);
      onUpdateOperation(
        fromJS({
          is_raw: true,
          operation_query: defaultQuery,
          advanced_config: { source: source.get('id') },
        }) as OperationMap,
      );
    }
    if (operation && source) {
      const operationSource = getSourceIDFromOperation(operation);
      // check if the source has been changed
      if (operationSource !== source.get('id')) {
        setValue(
          format(`SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`, {
            language: 'postgresql',
          }),
        );
      } else {
        setValue(format(operation.get('operation_query') as string, { language: 'postgresql' }));
      }
      if (!operation.get('is_raw')) {
        onUpdateOperation(operation.set('is_raw', true));
      }
      fetchPreviewData(operation);
    }
  }, [source, operation]);

  const fetchPreviewData = (operation: OperationMap) => {
    if (operation.get('advanced_config') && operation.get('operation_query')) {
      setDataLoading(true);
      fetchOperationDataPreview(operation.toJS() as unknown as Operation, []).then((results) => {
        setDataLoading(false);
        if (results.error) {
          console.log(results.error);

          // setAlert([`Error: ${results.error}`]);
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
    <>
      <CodeMirrorNext
        value={value}
        extensions={[sql({ dialect: PostgreSQL, upperCaseKeywords: true })]}
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
    </>
  );
};

export { SQLEditor };
