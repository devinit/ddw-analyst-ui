import React, { FunctionComponent } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ModalProps {
  title?: string;
  show: boolean;
  onHide: () => void;
  onOkay?: () => void;
}

export const BootstrapModal: FunctionComponent<ModalProps> = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
      <Modal.Footer>
        {props.onOkay ? (
          <Button variant="link" onClick={props.onHide}>
            OK
          </Button>
        ) : null}
        <Button variant="link" className="btn-danger" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
