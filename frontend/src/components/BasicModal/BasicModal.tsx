import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';

interface BasicModalProps extends ModalProps {
  title?: string;
  onOkay?: () => void;
  justifyFooter?: boolean;
}

export const BasicModal: FunctionComponent<BasicModalProps> = ({
  title,
  onOkay,
  justifyFooter,
  ...props
}) => {
  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
      <Modal.Footer className={classNames({ 'justify-content-center': justifyFooter })}>
        {onOkay ? (
          <Button variant="link" onClick={onOkay}>
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

BasicModal.defaultProps = {
  centered: true,
  size: 'lg',
};
