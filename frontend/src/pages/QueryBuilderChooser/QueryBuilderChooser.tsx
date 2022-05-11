import React, { FC, useState, useEffect } from 'react';
import * as localForage from 'localforage';
import { localForageKeys, api } from '../../utils';
import { Alert, Button, Collapse, Modal } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { ICheckData, IRadio } from '../../components/IRadio';
import { CheckBox } from '../../components/CheckBox';
import axios from 'axios';

type SelectedQueryBuilder = 'basic' | 'advanced';

// eslint-disable-next-line @typescript-eslint/ban-types
const QueryBuilderChooser: FC<RouteComponentProps> = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>();
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState<string>();
  const [show, setShow] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    localForage
      .getItem<string>(localForageKeys.PREFERENCES)
      .then((key) => setToken(key || undefined));
  }, []);
  const toggleModal = () => setShowModal(!showModal);
  const onBasic = () => setShow(!show);
  const onAdvanced = () => setOpen(!show);
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
    onBasic();
    onAdvanced();
  };

  const history = useHistory();
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.PREFERENCES).then((key) => {
      if (key) {
        if (key === 'advanced') {
          history.push('/queries/build/advanced/');
        } else {
          history.push('/queries/build/basic/');
        }
      }
      setChoice(key || undefined);
    });
  }, []);

  const handleChange = () => {
    setChecked(!checked);
  };

  const handleSave = () => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
      const userPreference = {
        preferences: selectedOption,
        global_choice: false,
      };
      axios
        .request({
          method: 'post',
          url: api.routes.USERPREFERENCE,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}`,
          },
          data: userPreference,
        })
        .then(() => {
          if (selectedOption || choice) {
            if (selectedOption === 'basic' || choice === 'basic') {
              history.push('/queries/build/basic/');
            } else {
              history.push('/queries/build/advanced/');
            }
          }
        })
        .catch((err) => console.log(err));
    });
    if (checked === true) {
      localForage.setItem(localForageKeys.PREFERENCES, selectedOption);
    }
  };

  return (
    <div>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IRadio
            variant="danger"
            id="basic"
            name="querybuilder"
            label="Basic"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'basic'}
          />
          <Collapse in={show}>
            <Alert variant="secondary" onClose={() => setShow(!show)}>
              <p>This is a Basic Query Builder </p>
            </Alert>
          </Collapse>
          <IRadio
            variant="danger"
            id="advanced"
            name="querybuilder"
            label="Advanced"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'advanced'}
          />
          <Collapse in={open}>
            <Alert variant="secondary">
              <p>This is the Advanced Query Builder, a better version with more functionalities</p>
            </Alert>
          </Collapse>
        </Modal.Body>
        <Modal.Footer>
          <CheckBox label="Remember choice" checked={checked} onChange={handleChange} />
          <Button onClick={handleSave}>Go to querybuilder</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
