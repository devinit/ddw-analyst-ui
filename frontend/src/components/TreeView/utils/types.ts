import { ReactElement } from 'react';

export interface TreeViewProps {
  data: Data[];
  depth?: number;

  deleteElement?: ReactElement;

  getStyleClassCb?: (node: Data) => void;

  isCheckable?: (node: Data, depth?: number) => void;
  isDeletable?: (node: Data, depth?: number) => void;
  isExpandable?: (node: Data, depth?: number) => void;

  keywordChildren?: string;
  keywordChildrenLoading?: string;
  keywordKey?: string;
  keywordLabel?: string;

  loadingElement?: ReactElement;
  noChildrenAvailableMessage?: string;

  onCheckToggleCb?: (data: Data[], depth?: number) => void;
  onDeleteCb?: (node: Data, data: Data[], depth?: number) => void;
  onExpandToggleCb?: (node: Data, depth?: number) => void;
  onUpdateCb?: (data: unknown[], depth?: number) => void;

  transitionEnterTimeout?: number;
  transitionExitTimeout?: number;
}

export interface Data {
  id: number;
  name: string;
  isExpanded?: boolean;
  isChecked?: boolean;
  isChildrenLoading?: boolean;
  children?: Data[];
}
