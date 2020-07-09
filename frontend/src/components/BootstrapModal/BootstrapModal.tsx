import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ModalProps {
  heading: string;
  subtitle: string;
  description: string;
  show: boolean;
  onHide: () => void;
}

export const BootstrapModal: React.SFC<ModalProps> = (props: ModalProps) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{props.heading}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{props.subtitle}</h4>
        <p>{props.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
