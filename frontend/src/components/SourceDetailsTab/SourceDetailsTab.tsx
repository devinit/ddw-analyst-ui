import * as React from 'react';
import { Nav, Tab, Card } from 'react-bootstrap';
import { SourceMap } from '../../reducers/sources';
import { SourceMetadata } from '../SourceMetadata';

interface SourceDetailsProps {
  source: SourceMap;
}

export class SourceDetailsTab extends React.Component<SourceDetailsProps> {
  render() {
    return (
      <Tab.Container defaultActiveKey="metadata">
        <Card>
          <Card.Body>

            <Nav variant="pills" className="nav-pills-danger" role="tablist">
              <Nav.Item>
                <Nav.Link eventKey="metadata">Metadata</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="columns">Columns</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="metadata">
                <SourceMetadata source={ this.props.source }/>
              </Tab.Pane>
              <Tab.Pane eventKey="columns">
                Columns
              </Tab.Pane>
            </Tab.Content>

          </Card.Body>
        </Card>
      </Tab.Container>
    );
  }
}
