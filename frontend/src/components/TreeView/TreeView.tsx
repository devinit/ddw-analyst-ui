import { cloneDeep, find, get, isEmpty, isEqual } from 'lodash';
import React, { FC, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ICheck, ICheckData } from '../ICheck';
import './styles.css';
import { Data, EnhancedNode, TreeViewProps } from './utils/types';

const TreeView: FC<TreeViewProps> = (props) => {
  const [data, setData] = useState(cloneDeep(props.data));

  useEffect(() => {
    setData(cloneDeep(props.data));
  }, [props.data]);

  const handleCheckToggle = (node: EnhancedNode, check: ICheckData) => {
    const { onCheckToggle: onCheckToggleCb, depth } = props;
    const _data = cloneDeep(data);
    const currentNode = find(_data, node) as EnhancedNode;
    const toggledNodes = [];
    currentNode.isChecked = check.checked;
    toggledNodes.push(currentNode);

    if (onCheckToggleCb) onCheckToggleCb(toggledNodes, depth);
    if (props.onUpdate) props.onUpdate(_data);
  };

  const handleDelete = (node: Data) => {
    const { onDelete: onDeleteCb, depth } = props;

    const newData = cloneDeep(data).filter((nodeItem) => {
      return !isEqual(node, nodeItem);
    });

    if (onDeleteCb) {
      onDeleteCb(node, newData, depth);
      if (props.onUpdate) props.onUpdate(newData);
    }
  };

  const handleExpandToggle = (node: Data) => {
    const { onExpandToggle: onExpandToggleCb, depth } = props;
    const updatedData = cloneDeep(data);
    const currentNode = find(updatedData, node) as Data;

    currentNode.isExpanded = !currentNode.isExpanded;

    if (onExpandToggleCb) onExpandToggleCb(currentNode, depth);
    if (props.onUpdate) props.onUpdate(updatedData);
  };

  const printCheckbox = (node: EnhancedNode) => {
    const { isCheckable, keywordLabel, depth } = props;
    const nodeText = keywordLabel ? (get(node, keywordLabel, '') as string) : '';

    if (isCheckable && isCheckable(node, depth)) {
      return (
        <ICheck
          id={`${node.id}`}
          name={node[keywordLabel as string] as string}
          label={nodeText}
          onChange={(check) => handleCheckToggle(node, check)}
          checked={!!node.isChecked}
          variant="danger"
          className="d-inline"
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

  const printNodes = (nodeArray: EnhancedNode[]) => {
    const {
      keywordKey,
      transitionEnterTimeout,
      transitionExitTimeout,
      getStyleClass: getStyleClassCb,
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
              return (
                <CSSTransition
                  {...nodeTransitionProps}
                  key={keywordKey ? (node[keywordKey] as string) || index : index}
                >
                  <div
                    className={`super-treeview-node${getStyleClassCb ? getStyleClassCb(node) : ''}`}
                  >
                    <div className="super-treeview-node-content">
                      {printExpandButton(node)}
                      {printCheckbox(node)}
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

  const printChildren = (node: EnhancedNode) => {
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
          data={keywordChildren ? (node[keywordChildren] as EnhancedNode[]) || [] : []}
          depth={(depth as number) + 1}
          onUpdate={onChildrenUpdateCb.bind(this)}
        />
      );
    }

    return <div className="super-treeview-children-container">{childrenElement}</div>;

    function onChildrenUpdateCb(updatedData: EnhancedNode[]) {
      const cloneData = cloneDeep(data);
      const currentNode = find(cloneData, node) as EnhancedNode;

      currentNode[keywordChildren as string] = updatedData;
      if (props.onUpdate) props.onUpdate(updatedData);
    }
  };

  return <div className="super-treeview">{printNodes(data)}</div>;
};

TreeView.defaultProps = {
  depth: 0,

  deleteElement: <div>(X)</div>,

  getStyleClass: (/* node, depth */) => {
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

  onDelete: (/* node, updatedData, depth */) => {
    return true;
  },

  transitionEnterTimeout: 1200,
  transitionExitTimeout: 1200,
};

export { TreeView };
