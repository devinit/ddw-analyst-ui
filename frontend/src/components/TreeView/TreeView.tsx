import React, { FC, ReactElement } from 'react';

interface TreeViewProps {
  data: unknown[];
  depth?: number;

  deleteElement?: ReactElement;

  getStyleClassCb?: () => void;

  isCheckable?: () => void;
  isDeletable?: () => void;
  isExpandable?: () => void;

  keywordChildren?: string;
  keywordChildrenLoading?: string;
  keywordKey?: string;
  keywordLabel?: string;

  loadingElement?: ReactElement;
  noChildrenAvailableMessage?: string;

  onCheckToggleCb?: () => void;
  onDeleteCb?: () => void;
  onExpandToggleCb?: () => void;
  onUpdateCb?: () => void;

  transitionEnterTimeout?: number;
  transitionExitTimeout?: number;
}

const TreeView: FC<TreeViewProps> = () => {
  return <div>Goes Here</div>;
};

TreeView.defaultProps = {
  depth: 0,

  deleteElement: <div>(X)</div>,

  getStyleClassCb: (/* node, depth */) => {
    return '';
  },
  isCheckable: (/* node, depth */) => {
    return true;
  },
  isDeletable: (/* node, depth */) => {
    return true;
  },
  isExpandable: (/* node, depth */) => {
    return true;
  },

  keywordChildren: 'children',
  keywordChildrenLoading: 'isChildrenLoading',
  keywordLabel: 'name',
  keywordKey: 'id',

  loadingElement: <div>loading...</div>,

  noChildrenAvailableMessage: 'No data found',

  onDeleteCb: (/* node, updatedData, depth */) => {
    return true;
  },

  transitionEnterTimeout: 1200,
  transitionExitTimeout: 1200,
};

export { TreeView };
