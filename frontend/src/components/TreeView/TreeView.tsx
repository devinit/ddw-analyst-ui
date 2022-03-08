import { cloneDeep, find, get, isEmpty, isEqual } from 'lodash';
import React, { FC, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ICheck, ICheckData } from '../ICheck';
import './styles.css';
import { Data, TreeViewProps } from './utils/types';

const TreeView: FC<TreeViewProps> = (props) => {
  const [data, setData] = useState(cloneDeep(props.data));

  useEffect(() => {
    setData(cloneDeep(props.data));
  }, [props.data]);

  const handleCheckToggle = (node: Data, check: ICheckData) => {
    const { onCheckToggle: onCheckToggleCb, depth } = props;
    const _data = cloneDeep(data);
    const currentNode = find(_data, node) as Data;
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

  const renderExpandToggle = (node: Data) => {
    const { onExpandToggle: onExpandToggleCb, depth } = props;
    const updatedData = cloneDeep(data);
    const currentNode = find(updatedData, node) as Data;

    currentNode.isExpanded = !currentNode.isExpanded;

    if (onExpandToggleCb) onExpandToggleCb(currentNode, depth);
    if (props.onUpdate) props.onUpdate(updatedData);
  };

  const renderCheckbox = (node: Data) => {
    const { isCheckable, depth } = props;
    const label = get(node, 'name', '');

    if (isCheckable && isCheckable(node, depth)) {
      return (
        <ICheck
          id={`${node.id}`}
          name={node.name}
          label={label}
          onChange={(check) => handleCheckToggle(node, check)}
          checked={node.isChecked}
          variant="danger"
          className="d-inline"
        />
      );
    }
  };

  const renderDeleteButton = (node: Data) => {
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

  const renderExpandButton = (node: Data) => {
    const className = node.isExpanded
      ? 'super-treeview-triangle-btn-down'
      : 'super-treeview-triangle-btn-right';
    const { isExpandable, depth } = props;

    if (isExpandable && isExpandable(node, depth)) {
      return (
        <div
          className={`super-treeview-triangle-btn ${className}`}
          onClick={() => {
            renderExpandToggle(node);
          }}
        />
      );
    } else {
      return <div className={`super-treeview-triangle-btn super-treeview-triangle-btn-none`} />;
    }
  };

  const renderNoChildrenMessage = () => {
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

  const renderNodes = (nodeArray: Data[]) => {
    const { transitionEnterTimeout, transitionExitTimeout, getStyleClass: getStyleClassCb } = props;

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
          ? renderNoChildrenMessage()
          : nodeArray.map((node, index) => {
              return (
                <CSSTransition {...nodeTransitionProps} key={node.id || index}>
                  <div
                    className={`super-treeview-node${getStyleClassCb ? getStyleClassCb(node) : ''}`}
                  >
                    <div className="super-treeview-node-content">
                      {renderExpandButton(node)}
                      {renderCheckbox(node)}
                      {renderDeleteButton(node)}
                    </div>
                    {renderChildren(node)}
                  </div>
                </CSSTransition>
              );
            })}
      </TransitionGroup>
    );
  };

  const renderChildren = (node: Data) => {
    if (!node.isExpanded) {
      return null;
    }

    const { depth } = props;
    const isChildrenLoading = get(node, 'isChildrenLoading', false);
    let childrenElement;

    if (isChildrenLoading) {
      childrenElement = get(props, 'loadingElement');
    } else {
      childrenElement = (
        <TreeView
          {...props}
          data={node.children || []}
          depth={(depth as number) + 1}
          onUpdate={onChildrenUpdate.bind(this)}
        />
      );
    }

    return <div className="super-treeview-children-container">{childrenElement}</div>;

    function onChildrenUpdate(updatedData: Data[]) {
      const cloneData = cloneDeep(data);
      const currentNode = find(cloneData, node) as Data;

      currentNode.children = updatedData;
      if (props.onUpdate) props.onUpdate(updatedData);
    }
  };

  return <div className="super-treeview">{renderNodes(data)}</div>;
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

  loadingElement: <div>loading...</div>,

  noChildrenAvailableMessage: 'No data found',

  onDelete: (/* node, updatedData, depth */) => {
    return true;
  },

  transitionEnterTimeout: 1200,
  transitionExitTimeout: 1200,
};

export { TreeView };
