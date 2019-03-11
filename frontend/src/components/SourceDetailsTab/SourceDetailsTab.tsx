import * as React from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../reducers/sources';
import { SourceColumns } from '../SourceColumns';
import { SourceMetadata } from '../SourceMetadata';
import { SourceUpdateHistory } from '../SourceUpdateHistory/SourceUpdateHistory';

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
              <Nav.Item>
                <Nav.Link eventKey="history">Update History</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="metadata">
                <SourceMetadata source={ this.props.source }/>
              </Tab.Pane>
              <Tab.Pane eventKey="columns">
                <SourceColumns columns={ this.props.source.get('columns') as ColumnList }/>
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                <SourceUpdateHistory history={ this.props.source.get('update_history') as UpdateHistoryList }/>
              </Tab.Pane>
            </Tab.Content>

          </Card.Body>
        </Card>
      </Tab.Container>
    );
  }
}
