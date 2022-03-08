import { cloneDeep, find, get, isEmpty, isEqual, isNil } from 'lodash';
import React, { FC, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Data, TreeViewProps } from './utils/types';

const TreeView: FC<TreeViewProps> = (props) => {
  const [data, setData] = useState(cloneDeep(props.data));
  const [lastCheckToggledNodeIndex, setLastCheckToggledNodeIndex] = useState<number | null>(null);

  useEffect(() => {
    setData(cloneDeep(props.data));
  }, [props.data]);
  useEffect(() => {
    if (props.onUpdateCb) props.onUpdateCb(data, props.depth);
  }, data);

  const handleCheckToggle = (node: Data, event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    const { onCheckToggleCb, depth } = props;
    const _data = cloneDeep(data);
    const currentNode = find(_data, node) as Data;
    const currentNodeIndex = _data.indexOf(currentNode);
    const toggledNodes = [];
    if (event.shiftKey && !isNil(lastCheckToggledNodeIndex)) {
      const rangeStart = Math.min(currentNodeIndex, lastCheckToggledNodeIndex);
      const rangeEnd = Math.max(currentNodeIndex, lastCheckToggledNodeIndex);

      const nodeRange = _data.slice(rangeStart, rangeEnd + 1);

      nodeRange.forEach((node) => {
        node.isChecked = (event.target as any).checked;
        toggledNodes.push(node);
      });
    } else {
      currentNode.isChecked = (event.target as any).checked;
      toggledNodes.push(currentNode);
    }

    if (onCheckToggleCb) onCheckToggleCb(toggledNodes, depth);
    setLastCheckToggledNodeIndex(currentNodeIndex);
    if (props.onUpdateCb) props.onUpdateCb(_data);
  };

  const handleDelete = (node: Data) => {
    const { onDeleteCb, depth } = props;

    const newData = cloneDeep(data).filter((nodeItem) => {
      return !isEqual(node, nodeItem);
    });

    if (onDeleteCb) {
      onDeleteCb(node, newData, depth);
      if (props.onUpdateCb) props.onUpdateCb(newData);
    }
  };

  const handleExpandToggle = (node: Data) => {
    const { onExpandToggleCb, depth } = props;
    const updatedData = cloneDeep(data);
    const currentNode = find(updatedData, node) as Data;

    currentNode.isExpanded = !currentNode.isExpanded;

    if (onExpandToggleCb) onExpandToggleCb(currentNode, depth);
    if (props.onUpdateCb) props.onUpdateCb(updatedData);
  };

  const printCheckbox = (node: Data) => {
    const { isCheckable, keywordLabel, depth } = props;

    if (isCheckable && isCheckable(node, depth)) {
      return (
        <input
          type="checkbox"
          name={(node as any)[keywordLabel as string]}
          onClick={(e) => {
            handleCheckToggle(node, e);
          }}
          checked={!!node.isChecked}
          id={`${node.id}`}
        />
      );
    }
  };

  const printDeleteButton = (node: Data) => {
    const { isDeletable, depth, deleteElement } = props;

    if (isDeletable && isDeletable(node, depth)) {
      return (
        <div
          className="delete-btn"
          onClick={() => {
            handleDelete(node);
          }}
        >
          {deleteElement}
        </div>
      );
    }
  };

  const printExpandButton = (node: Data) => {
    const className = node.isExpanded
      ? 'super-treeview-triangle-btn-down'
      : 'super-treeview-triangle-btn-right';
    const { isExpandable, depth } = props;

    if (isExpandable && isExpandable(node, depth)) {
      return (
        <div
          className={`super-treeview-triangle-btn ${className}`}
          onClick={() => {
            handleExpandToggle(node);
          }}
        />
      );
    } else {
      return <div className={`super-treeview-triangle-btn super-treeview-triangle-btn-none`} />;
    }
  };

  const printNoChildrenMessage = () => {
    const { transitionExitTimeout, noChildrenAvailableMessage } = props;
    const noChildrenTransitionProps = {
      classNames: 'super-treeview-no-children-transition',
      key: 'super-treeview-no-children',
      style: {
        transitionDuration: `${transitionExitTimeout}ms`,
        transitionDelay: `${transitionExitTimeout}ms`,
      },
      timeout: {
        enter: transitionExitTimeout,
      },
      exit: false,
    };

    return (
      <CSSTransition {...noChildrenTransitionProps}>
        <div className="super-treeview-no-children">
          <div className="super-treeview-no-children-content">{noChildrenAvailableMessage}</div>
        </div>
      </CSSTransition>
    );
  };

  const printNodes = (nodeArray: Data[]) => {
    const {
      keywordKey,
      keywordLabel,
      transitionEnterTimeout,
      transitionExitTimeout,
      getStyleClassCb,
    } = props;

    const nodeTransitionProps = {
      classNames: 'super-treeview-node-transition',
      style: {
        transitionDuration: `${transitionEnterTimeout}ms`,
      },
      timeout: {
        enter: transitionEnterTimeout,
        exit: transitionExitTimeout,
      },
    };

    return (
      <TransitionGroup>
        {isEmpty(nodeArray)
          ? printNoChildrenMessage()
          : nodeArray.map((node, index) => {
              const nodeText = keywordLabel ? get(node, keywordLabel, '') : '';

              return (
                <CSSTransition
                  {...nodeTransitionProps}
                  key={keywordKey ? (node as any)[keywordKey] || index : index}
                >
                  <div
                    className={`super-treeview-node${getStyleClassCb ? getStyleClassCb(node) : ''}`}
                  >
                    <div className="super-treeview-node-content">
                      {printExpandButton(node)}
                      {printCheckbox(node)}
                      <label
                        htmlFor={`${node.id}`}
                        title={nodeText}
                        className="super-treeview-text"
                      >
                        {nodeText}
                      </label>
                      {printDeleteButton(node)}
                    </div>
                    {printChildren(node)}
                  </div>
                </CSSTransition>
              );
            })}
      </TransitionGroup>
    );
  };

  const printChildren = (node: Data) => {
    if (!node.isExpanded) {
      return null;
    }

    const { keywordChildren, keywordChildrenLoading, depth } = props;
    const isChildrenLoading = keywordChildrenLoading
      ? get(node, keywordChildrenLoading, false)
      : false;
    let childrenElement;

    if (isChildrenLoading) {
      childrenElement = get(props, 'loadingElement');
    } else {
      childrenElement = (
        <TreeView
          {...props}
          data={keywordChildren ? (node as any)[keywordChildren] || [] : []}
          depth={(depth as number) + 1}
          onUpdateCb={onChildrenUpdateCb.bind(this)}
        />
      );
    }

    return <div className="super-treeview-children-container">{childrenElement}</div>;

    function onChildrenUpdateCb(updatedData: Data[]) {
      const cloneData = cloneDeep(data);
      const currentNode = find(cloneData, node);

      (currentNode as any)[keywordChildren as string] = updatedData;
      if (props.onUpdateCb) props.onUpdateCb(updatedData);
    }
  };

  return <div className="super-treeview">{printNodes(data)}</div>;
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
