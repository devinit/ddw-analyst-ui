import { ReactElement } from 'react';

export interface TreeViewProps {
  data: Data[];
  depth?: number;
  deleteElement?: ReactElement;
  getStyleClass?: (node: Data) => void;
  isCheckable?: (node: Data, depth?: number) => boolean;
  isDeletable?: (node: Data, depth?: number) => boolean;
  isExpandable?: (node: Data, depth?: number) => boolean;
  loadingElement?: ReactElement;
  noChildrenAvailableMessage?: string;
  onCheckToggle?: (data: Data[], depth?: number) => void;
  onDelete?: (node: Data, data: Data[], depth?: number) => void;
  onExpandToggle?: (node: Data, depth?: number) => void;
  onUpdate?: (data: unknown[], depth?: number) => void;
  transitionEnterTimeout?: number;
  transitionExitTimeout?: number;
  className?: string;
}

export interface Data {
  id: number | string;
  name: string;
  isExpanded?: boolean;
  isChecked?: boolean;
  isChildrenLoading?: boolean;
  children?: Data[];
}
