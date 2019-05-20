import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ConditionalRender } from '@bit/devinit.analyst-ui.components.conditional-render';

interface SocialLineProps {
  google?: boolean;
  facebook?: boolean;
  twitter?: boolean;
  onGoogle?: () => void;
  onFacebook?: () => void;
  onTwitter?: () => void;
}

export const SocialLine: React.SFC<SocialLineProps> = props => {
  return (
    <div className="social-line">
      <ConditionalRender render={ !!props.google }>
        <Button variant="link" className="btn-white" onClick={ props.onGoogle }>
          <i className="fa fa-google"/>
        </Button>
      </ConditionalRender>
      <ConditionalRender render={ !!props.facebook }>
        <Button variant="link" className="btn-white" onClick={ props.onFacebook }>
          <i className="fa fa-facebook"/>
        </Button>
      </ConditionalRender>
      <ConditionalRender render={ !!props.twitter }>
        <Button variant="link" className="btn-white" onClick={ props.onTwitter }>
          <i className="fa fa-twitter"/>
        </Button>
      </ConditionalRender>
    </div>
  );
};
