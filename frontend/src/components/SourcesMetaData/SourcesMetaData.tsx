import { List } from 'immutable';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ColumnList, ColumnMap, SourceMap } from '../../types/sources';
import { useSources } from '../../utils/hooks';
import { TreeView } from '../TreeView';
import { Data } from '../TreeView/utils/types';

const StyledWrapper = styled.div`
  max-height: 600px;
  height: 100%;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const createTreeDataFromColumn = (column: ColumnMap) => ({
  id: column.get('id'),
  name: column.get('name'),
});

const createTreeDataFromSource = (source: SourceMap): Data => {
  const columns = source.get('columns') as ColumnList;
  const treeData: Data = {
    id: source.get('id') as number,
    name: source.get('active_mirror_name') as string,
    children: columns.map(createTreeDataFromColumn).toJS() as Data[],
  };

  return treeData;
};

const createTreeDataFromSources = (sources: List<SourceMap>): Data[] =>
  sources.map(createTreeDataFromSource).toJS() as Data[];

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
    <StyledWrapper className="border-left p-2">
      <TreeView
        data={treeData}
        onUpdate={onUpdate}
        isCheckable={() => false}
        isDeletable={() => false}
        isExpandable={(node) => !!node.children}
      />
    </StyledWrapper>
  );
};

export { SourcesMetaData };
