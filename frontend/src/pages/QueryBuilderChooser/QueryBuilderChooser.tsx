import React, { FC, useState } from 'react';
import { Button, Modal, Form, Popover, OverlayTrigger } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const QueryBuilderChooser: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState('advanced');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const history = useHistory();

  const popover1 = (
    <Popover id="popover-basic">
      <Popover.Content>Basic Query Builder</Popover.Content>
    </Popover>
  );

  const popover2 = (
    <Popover id="popover-basic">
      <Popover.Content>Advanced Query Builder (BETA)</Popover.Content>
    </Popover>
  );

  return (
    <div>
      <div>Choose a Query Builder Here</div>
      <Button
        variant="link"
        onClick={() => {
          handleShow();
          console.log('click');
        }}
      >
        {' '}
        Choose{' '}
      </Button>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <OverlayTrigger trigger="focus" placement="top-end" overlay={popover1}>
              <Form.Check
                inline
                label="Basic"
                name="querybuilder"
                value="basicQ"
                type="radio"
                id="base"
                checked={isChecked === 'basicQ'}
                onChange={(e) => {
                  setIsChecked(e.target.value);
                }}
                onClick={() => {
                  history.push('/queries/build/');
                }}
              />
            </OverlayTrigger>
            <OverlayTrigger trigger="focus" placement="top-end" overlay={popover2}>
              <Form.Check
                inline
                label="Advanced"
                name="querybuilder"
                value="advanced"
                type="radio"
                id="advance"
                checked={isChecked === 'advanced'}
                onChange={(e) => {
                  setIsChecked(e.target.value);
                  console.log('yesh');
                }}
                onClick={() => {
                  history.push('/queries/build/advanced');
                }}
              />
            </OverlayTrigger>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <input type="checkbox" />
          <label>Remember my choice</label>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
