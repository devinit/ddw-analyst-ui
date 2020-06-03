import React, { FunctionComponent } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { useSources } from '../../hooks';
import { Source } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';

interface ComponentProps {
  onComplete?: (dataSource: Source) => void;
}

const StepOne: FunctionComponent<ComponentProps> = ({ onComplete }) => {
  const sources = useSources();
  const onChange = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ): void => {
    if (onComplete && sources) {
      const selectedSource = sources.find((source) => source.id === (data.value as number));
      if (selectedSource) {
        onComplete(selectedSource);
      }
    }
  };

  return (
    <>
      <h5 className="info-text">Select the data source you wish to update</h5>
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        These are predetermined as not all data sources are open to being updated via this
        interface.
      </Alert>
      <Row>
        <Col sm={4}>
          <Dropdown
            className="btn btn-danger text-capitalize"
            placeholder="Select Data Source"
            fluid
            selection
            options={getSelectOptionsFromSources(sources)}
            onChange={onChange}
          />
        </Col>
      </Row>
    </>
  );
};

export { StepOne };
