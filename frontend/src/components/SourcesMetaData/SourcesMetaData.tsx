import React, { FC } from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  height: 100%;
`;

const SourcesMetaData: FC = () => {
  return <StyledWrapper className="border-left p-2">Sources Go Here</StyledWrapper>;
};

export { SourcesMetaData };
