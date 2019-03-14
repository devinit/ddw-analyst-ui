import { Map } from 'immutable';
import * as React from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../reducers/sources';
import { InfoList, InfoListItems } from '../InfoList';
import { SourceMetadata } from '../SourceMetadata';

interface SourceDetailsProps {
  source: SourceMap;
}

export class SourceDetailsTab extends React.Component<SourceDetailsProps> {
  render() {
    return (
      <Tab.Container defaultActiveKey="metadata">
        <Card className="source-details">
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
                <InfoList
                  list={ this.getColumns() }
                  limit={ 10 }
                  offset={ 0 }
                  className="source-columns-table"
                />
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                <InfoList
                  list={ this.getUpdateHistory() }
                  limit={ 10 }
                  offset={ 0 }
                  className="source-history-table"
                />
              </Tab.Pane>
            </Tab.Content>

          </Card.Body>
        </Card>
      </Tab.Container>
    );
  }

  private getColumns(): InfoListItems {
    return (this.props.source.get('columns') as ColumnList).map(column =>
      Map()
        .set('caption', column.get('source_name') as string)
        .set('info', column.get('description') as string)) as InfoListItems;
  }

  private getUpdateHistory(): InfoListItems {
    return (this.props.source.get('update_history') as UpdateHistoryList).map(history =>
      Map()
        .set('caption', new Date(history.get('released_on') as string).toString())
        .set('info', history.get('release_description') as string)) as InfoListItems;
  }
}
