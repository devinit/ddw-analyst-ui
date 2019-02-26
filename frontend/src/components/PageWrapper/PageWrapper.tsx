import * as React from 'react';
import classNames from 'classnames';

interface PageWrapperProps {
  fullPage?: boolean;
}

export const PageWrapper: React.SFC<PageWrapperProps> = props => {
  return (
    <div className={ classNames('wrapper', { 'wrapper-full-page': props.fullPage }) } >
      { props.children }
    </div>
  );
};
