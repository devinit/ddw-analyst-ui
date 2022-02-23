import React, { FC, useState } from 'react';
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap';
import { ICheckData, IRadio } from '../../components/IRadio';

type SelectedQueryBuilder = 'basic' | 'advanced';

const QueryBuilderChooser: FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedBtn, setSelectedBtn] = useState<SelectedQueryBuilder>('advanced');

  const toggleModal = () => setShowModal(!showModal);
  const onRadioChange = (data: ICheckData) => setSelectedBtn(data.value as SelectedQueryBuilder);

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
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayTrigger trigger="focus" placement="top-end" overlay={popover1}>
            <IRadio
              variant="danger"
              id="base"
              name="querybuilder"
              label="Basic"
              onChange={onRadioChange}
              inline
              checked={selectedBtn === 'basic'}
            />
          </OverlayTrigger>
          <OverlayTrigger trigger="focus" placement="top-end" overlay={popover2}>
            <IRadio
              variant="danger"
              id="advance"
              name="querybuilder"
              label="Advanced"
              onChange={onRadioChange}
              inline
              checked={selectedBtn === 'advanced'}
            />
          </OverlayTrigger>
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
