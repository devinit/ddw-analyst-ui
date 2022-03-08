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
    const { onCheckToggle, depth } = props;
    const dataClone = cloneDeep(data);
    const currentNode = find(dataClone, node) as Data;
    const toggledNodes = [];
    currentNode.isChecked = check.checked;
    toggledNodes.push(currentNode);

    if (onCheckToggle) onCheckToggle(toggledNodes, depth);
    if (props.onUpdate) props.onUpdate(dataClone);
  };

  const handleDelete = (node: Data) => {
    const { onDelete, depth } = props;

    const newData = cloneDeep(data).filter((nodeItem) => {
      return !isEqual(node, nodeItem);
    });

    if (onDelete) {
      onDelete(node, newData, depth);
      if (props.onUpdate) props.onUpdate(newData);
    }
  };

  const onToggleExpand = (node: Data) => {
    const { onExpandToggle, depth } = props;
    const updatedData = cloneDeep(data);
    const currentNode = find(updatedData, node) as Data;

    currentNode.isExpanded = !currentNode.isExpanded;

    if (onExpandToggle) onExpandToggle(currentNode, depth);
    if (props.onUpdate) props.onUpdate(updatedData);
  };

  const renderCheckbox = (node: Data) => {
    const { isCheckable, depth } = props;
    const label = get(node, 'name', '');

    if (isCheckable && isCheckable(node, depth)) {
      return (
        <ICheck
          id={`${node.id}-${node.name.split(' ').join('')}`}
          name={node.name}
          label={label}
          onChange={(check) => handleCheckToggle(node, check)}
          checked={!!node.isChecked}
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
        <div className="delete-btn" onClick={() => handleDelete(node)}>
          {deleteElement}
        </div>
      );
    }
  };

  const renderExpandButton = (node: Data) => {
    const className = `super-treeview-triangle-btn-${node.isExpanded ? 'down' : 'right'}`;
    const { isExpandable, depth } = props;

    if (isExpandable && isExpandable(node, depth)) {
      return (
        <div
          className={`super-treeview-triangle-btn ${className}`}
          onClick={() => onToggleExpand(node)}
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
    const { transitionEnterTimeout, transitionExitTimeout, getStyleClass } = props;

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
                  <div className={`super-treeview-node${getStyleClass ? getStyleClass(node) : ''}`}>
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
          onUpdate={onChildrenUpdate}
        />
      );
    }

    return <div className="super-treeview-children-container">{childrenElement}</div>;

    function onChildrenUpdate(updatedData: Data[]) {
      const cloneData = cloneDeep(data);
      const currentNode = find(cloneData, node) as Data;

      currentNode.children = updatedData;
      if (props.onUpdate) props.onUpdate(cloneData);
    }
  };

  return <div className="super-treeview">{renderNodes(data)}</div>;
};

TreeView.defaultProps = {
  depth: 0,
  deleteElement: <i className="fa fa-trash"></i>,
  getStyleClass: (/* node, depth */) => '',
  isCheckable: (/* node, depth */) => true,
  isDeletable: (/* node, depth */) => true,
  isExpandable: (/* node, depth */) => true,
  loadingElement: <div>loading...</div>,
  noChildrenAvailableMessage: 'No data found',
  onDelete: (/* node, updatedData, depth */) => true,
  transitionEnterTimeout: 1200,
  transitionExitTimeout: 1200,
};

export { TreeView };
