import axios from 'axios';
import * as localForage from 'localforage';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { CheckBox } from '../../components/CheckBox';
import { ICheckData, IRadio } from '../../components/IRadio';
import { api, localForageKeys } from '../../utils';

type SelectedQueryBuilder = 'basic' | 'advanced';

const QueryBuilderChooser: FC<RouteComponentProps> = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>('advanced');
  const [checked, setChecked] = useState(false);
  const history = useHistory();

  const toggleModal = () => {
    setShowModal(!showModal);
    history.push('/queries/build/advanced/');
  };
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };

  useEffect(() => {
    localForage.getItem<any>(localForageKeys.PREFERENCES).then((key) => {
      if (key) {
        history.push(`/queries/build/${key.queryBuilder}/`);
      }
    });
  }, []);

  const onCheckboxChange = () => {
    setChecked(!checked);
    const userPreference = {
      preferences: { queryBuilder: selectedOption },
      global_choice: false,
    };
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
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
        .then((response) => {
          response.data;
          console.log(response.data);
        })
        .catch((err) => console.log(err));
    });
    if (checked === true) {
      localForage.setItem(localForageKeys.PREFERENCES, userPreference.preferences);
    }
  };

  const handleSave = () => {
    if (selectedOption) {
      history.push(`/queries/build/${selectedOption}/`);
    }
  };

  const basicMessage =
    'The original Query Builder. Creates queries using interconnected steps - no SQL knowledge required.';
  const advancedMessage =
    'An improved UI with a lot more flexibility & options for creating advanced queries. Some of its features require a little SQL knowledge.';
  // eslint-disable-next-line prettier/prettier
  const alertMessage = () => selectedOption === 'basic' ? <p style={{ fontSize: 14 }}>{basicMessage}</p> : <p style={{ fontSize: 14 }}>{advancedMessage}</p>;

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
          <CheckBox label="Remember my choice" checked={checked} onChange={onCheckboxChange} />
          <Button onClick={handleSave} variant="btn-danger" className="btn-danger">
            Go to Query Builder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
