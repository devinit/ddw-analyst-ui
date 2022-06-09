import * as React from 'react';
import classNames from 'classnames';

interface PageWrapperProps {
  fullPage?: boolean;
  children?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = (props) => {
  return (
    <div className={classNames('wrapper', { 'wrapper-full-page': props.fullPage })}>
      {props.children}
    </div>
  );
};
