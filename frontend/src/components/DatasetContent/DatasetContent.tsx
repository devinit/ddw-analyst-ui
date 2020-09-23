import * as React from 'react';

export const DatasetContent: React.SFC = (props) => {
  return (
    <div className="content pt-0">
      <div className="container-fluid">{props.children}</div>
    </div>
  );
};
