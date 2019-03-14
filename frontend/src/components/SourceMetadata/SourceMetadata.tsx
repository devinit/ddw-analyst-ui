import * as React from 'react';
import { SourceMap } from '../../reducers/sources';

export const SourceMetadata: React.SFC<{ source: SourceMap }> = props => {
  return (
    <React.Fragment>
      <div className="font-weight-bold">Source</div>
      <div className="font-weight-light">
        { props.source.get('source') }
        <span className="text-uppercase">
          { ` (${props.source.get('source_acronym')})` }
        </span>
      </div>
      <div className="font-weight-bold">Abstract</div>
      <div className="font-weight-light">
        { props.source.get('description') }
      </div>
      <hr/>
      <div className="font-weight-light">
        <a href={ props.source.get('source_url') as string } target="_blank">
          <i className="material-icons mr-2">business</i>
          <span className="align-middle">{ props.source.get('source_url') }</span>
        </a>
      </div>
      <div className="font-weight-light">
        <a href={ props.source.get('download_path') as string } target="_blank">
          <i className="material-icons mr-2">cloud_download</i>
          <span className="align-middle">{ props.source.get('download_path') }</span>
        </a>
      </div>
    </React.Fragment>
  );
};
