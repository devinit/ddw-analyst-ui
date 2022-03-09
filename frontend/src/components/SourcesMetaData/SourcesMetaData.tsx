import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSources } from '../../utils/hooks';
import { SearchInput } from '../SearchInput';
import { TreeView } from '../TreeView';
import { Data } from '../TreeView/utils/types';
import { createTreeDataFromSources } from './utils';

const StyledWrapper = styled.div`
  max-height: 640px;
  height: 100%;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;
const StyledSearchInput = styled(SearchInput)`
  position: sticky;
  top: 0;
  background: #fff !important;
  border-bottom: 1px solid #dee2e6;
`;

const SourcesMetaData: FC = () => {
  const [treeData, setTreeData] = useState<Data[]>([]);
  const sources = useSources({ limit: 200, offset: 0 });

  const onUpdate = (updatedData: Data[]) => {
    setTreeData(updatedData);
  };

  useEffect(() => {
    setTreeData(createTreeDataFromSources(sources));
  }, [sources.count()]);

  return (
    <StyledWrapper>
      <StyledSearchInput placeholder="Search tables or columns" />
      <TreeView
        data={treeData}
        onUpdate={onUpdate}
        isCheckable={() => false}
        isDeletable={() => false}
        isExpandable={(node) => !!node.children}
        className="pt-2"
      />
    </StyledWrapper>
  );
};

export { SourcesMetaData };
