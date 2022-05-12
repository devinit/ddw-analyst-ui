import React, { FC, useState, useEffect } from 'react';
import * as localForage from 'localforage';
import { localForageKeys, api } from '../../utils';
import { Alert, Button, Modal } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { ICheckData, IRadio } from '../../components/IRadio';
import { CheckBox } from '../../components/CheckBox';
import axios from 'axios';

type SelectedQueryBuilder = 'basic' | 'advanced';

// eslint-disable-next-line @typescript-eslint/ban-types
const QueryBuilderChooser: FC<RouteComponentProps> = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>('advanced');
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState<string>();

  const toggleModal = () => {
    setShowModal(!showModal);
    history.push('/queries/build/advanced/');
  };
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };

  const history = useHistory();
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.PREFERENCES).then((key) => {
      if (key) {
        setChoice(key || undefined);
        if (key === 'advanced') {
          history.push('/queries/build/advanced/');
        } else {
          history.push('/queries/build/basic/');
        }
      }
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
  const alertMessage = () => {
    if (selectedOption === 'basic') {
      return (
        <p style={{ fontSize: 14 }}>
          The original Query Builder. Creates queries using interconnected steps - no SQL knowledge
          required.
        </p>
      );
    } else {
      return (
        <p style={{ fontSize: 14 }}>
          An improved UI with a lot more flexibility & options for creating advanced queries. Some
          of its features require a little SQL knowledge.
        </p>
      );
    }
  };

  return (
    <div>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Select Query Builder</Modal.Title>
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
          <IRadio
            variant="danger"
            id="advanced"
            name="querybuilder"
            label="Advanced"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'advanced'}
          />
          <Alert variant="secondary" className="p-2">
            {alertMessage()}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <CheckBox label="Remember my choice" checked={checked} onChange={handleChange} />
          <Button onClick={handleSave} variant="btn-danger" className="btn-danger">
            Go to Query Builder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
