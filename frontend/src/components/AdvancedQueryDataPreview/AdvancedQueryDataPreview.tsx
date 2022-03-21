import { fromJS } from 'immutable';
import React, { FC, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Dimmer, Loader } from 'semantic-ui-react';
import styled from 'styled-components';
import { AdvancedQueryOptions, OperationData, OperationDataList } from '../../types/operations';
import { previewAdvancedDatasetData } from '../../utils/hooks';
import { OperationPreview } from '../OperationPreview';

const StyledWrapper = styled.div`
  min-height: 400px;
`;

export const AdvancedQueryDataPreview: FC<{ options?: AdvancedQueryOptions }> = ({ options }) => {
  const [data, setData] = useState<OperationData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState<string[]>([]);

  useEffect(() => {
    if (options) {
      fetchPreviewData(options);
    }
  }, [options]);

  const fetchPreviewData = (_options: AdvancedQueryOptions) => {
    setDataLoading(true);
    previewAdvancedDatasetData(_options).then((results) => {
      setDataLoading(false);
      if (results.error) {
        setAlert([`Error: ${results.error}`]);
      } else {
        setData(results.data ? results.data.slice(0, 9) : []);
        setAlert([]);
      }
    });
  };

  return (
    <StyledWrapper>
      <Dimmer active={dataLoading || !options} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Alert variant="warning" show={!!alert.length} className="mt-2">
        {alert.map((message, index) => (
          <p key={`${index}`}>{message}</p>
        ))}
      </Alert>
      <OperationPreview
        show
        data={fromJS(data) as OperationDataList}
        onClose={() => true}
        tableOnly
        loading={dataLoading}
      />
    </StyledWrapper>
  );
};

export default AdvancedQueryDataPreview;
