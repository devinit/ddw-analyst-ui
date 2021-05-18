import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { Alert, Card, Tab } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationMap } from '../../types/operations';
import { OperationForm } from '../OperationForm';

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
};

const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

const OperationTabContainer: FunctionComponent<ComponentProps> = (props) => {
  const [alertMessages, setAlertMessages] = useState<string[]>(props.alertMessages || []);

  useEffect(() => {
    if (props.alertMessages) {
      // FIXME: should prop alert messages clear this state?
      setAlertMessages(props.alertMessages);
    }
  }, [props.alertMessages]);

  const onAlertClose = (): void => setAlertMessages(['']);

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

const OperationTabContainerMemo = React.memo<PropsWithChildren<ComponentProps>>(
  OperationTabContainer,
);

export { OperationTabContainerMemo as OperationTabContainer };
