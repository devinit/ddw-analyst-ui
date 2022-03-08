import { ReactElement } from 'react';

export interface TreeViewProps {
  data: EnhancedNode[];
  depth?: number;

  deleteElement?: ReactElement;

  getStyleClass?: (node: Data) => void;

  isCheckable?: (node: Data, depth?: number) => void;
  isDeletable?: (node: Data, depth?: number) => void;
  isExpandable?: (node: Data, depth?: number) => void;

  keywordChildren?: string;
  keywordChildrenLoading?: string;
  keywordKey?: string;
  keywordLabel?: string;

  loadingElement?: ReactElement;
  noChildrenAvailableMessage?: string;

  onCheckToggle?: (data: Data[], depth?: number) => void;
  onDelete?: (node: Data, data: Data[], depth?: number) => void;
  onExpandToggle?: (node: Data, depth?: number) => void;
  onUpdate?: (data: unknown[], depth?: number) => void;

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

export type EnhancedNode = Data & { [key: string]: unknown };
