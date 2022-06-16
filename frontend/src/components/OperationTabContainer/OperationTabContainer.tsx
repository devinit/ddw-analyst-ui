import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { Alert, Card, Tab, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationMap } from '../../types/operations';
import { OperationForm } from '../OperationForm';
import { useHistory } from 'react-router-dom';
import { QueryBuilderContext } from '../../pages/QueryBuilder/QueryBuilder';

type ComponentProps = {
  operation?: OperationMap;
  valid?: boolean;
  editable?: boolean;
  processing?: boolean;
  previewing?: boolean;
  validating?: boolean;
  alertMessages?: string[];
  onSave: (preview?: boolean) => void;
  onUpdate: (operation?: OperationMap) => void;
  onPreview?: () => void;
  onDelete: (operation?: OperationMap) => void;
  onReset?: () => void;
  onValidate?: () => void;
  children?: React.ReactNode;
};

const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

const OperationTabContainer: FunctionComponent<ComponentProps> = (props) => {
  const [alertMessages, setAlertMessages] = useState<string[]>(props.alertMessages || []);

  const value = React.useContext(QueryBuilderContext);

  const history = useHistory();

  useEffect(() => {
    if (props.alertMessages) {
      // FIXME: should prop alert messages clear this state?
      setAlertMessages(props.alertMessages);
    }
  }, [props.alertMessages]);

  const onAlertClose = (): void => setAlertMessages(['']);

  const handleSwitchButton = () => {
    if (value) {
      history.push('/queries/build/');
    } else {
      history.push('/queries/build/advanced/');
    }
  };

  return (
    <Tab.Container defaultActiveKey="operation">
      <Card className="source-details">
        <Card.Header className="card-header-text card-header-danger">
          <Card.Text>Dataset</Card.Text>
        </Card.Header>
        <StyledCardBody>
          <Alert
            variant="dark"
            show={!!alertMessages.length}
            onClose={onAlertClose}
            className="mb-4 mt-4 alert-with-icon"
            data-testid="qb-alert"
          >
            <i className="material-icons mr-2 text-danger" data-notify="icon">
              error
            </i>
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
              <i className="material-icons">close</i>
            </button>
            <span>
              {alertMessages.map((message, index) => (
                <p key={`${index}`} className="mb-2">
                  {message}
                </p>
              ))}
            </span>
          </Alert>

          <Button
            variant="dark"
            className="btn btn-sm btn-dark"
            onClick={() => handleSwitchButton()}
            style={{ position: 'absolute', right: 9, top: -20 }}
          >
            Switch to {value.defaultValue} Query Builder
          </Button>

          <OperationForm
            operation={props.operation}
            editable={props.editable}
            valid={props.valid}
            onUpdateOperation={props.onUpdate}
            onSuccess={props.onSave}
            onPreview={props.onPreview}
            previewing={props.previewing}
            processing={props.processing}
            validating={props.validating}
            onDeleteOperation={props.onDelete}
            onReset={props.onReset}
            onValidate={props.onValidate}
          >
            {props.children}
          </OperationForm>
        </StyledCardBody>
      </Card>
    </Tab.Container>
  );
};

const OperationTabContainerMemo =
  React.memo<PropsWithChildren<ComponentProps>>(OperationTabContainer);

export { OperationTabContainerMemo as OperationTabContainer };
