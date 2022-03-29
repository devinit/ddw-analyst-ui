import React, { FC, useState, useEffect } from 'react';
import * as localForage from 'localforage';
import { localForageKeys, api } from '../../utils';
import { Alert, Modal } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ICheckData, IRadio } from '../../components/IRadio';
import AdvancedQueryBuilder from '../AdvancedQueryBuilder/AdvancedQueryBuilder';
import QueryBuilder from '../QueryBuilder/QueryBuilder';
import { CheckBox } from '../../components/CheckBox';
import axios from 'axios';

type SelectedQueryBuilder = 'basic' | 'advanced';

// eslint-disable-next-line @typescript-eslint/ban-types
const QueryBuilderChooser: FC<RouteComponentProps> = (props: RouteComponentProps<{}>) => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>();
  const [checked, setChecked] = useState(false);

  const [choice, setChoice] = useState<string>();

  useEffect(() => {
    localForage.getItem<string>(localForageKeys.PREFERENCES).then((token) => {
      const userPreference = {
        preferences: selectedOption,
        global_choice: false,
      };
      axios
        .post(api.routes.USERPREFERENCE, userPreference, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `token ${token}`,
          },
        })
        .then((res) => res.data)
        .catch((err) => console.log(err));
    });
  }, []);
  // setChoice(key || undefined)
  const toggleModal = () => setShowModal(!showModal);
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };

  const handleChange = () => {
    setChecked(!checked);
  };

  if (selectedOption) {
    if (selectedOption === 'basic') {
      return <QueryBuilder {...props} />;
    } else {
      return <AdvancedQueryBuilder {...props} />;
    }
  }

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
          <Alert variant="secondary">
            <p>The Basic Query Builder </p>
          </Alert>
          <IRadio
            variant="danger"
            id="advanced"
            name="querybuilder"
            label="Advanced"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'advanced'}
          />
          <Alert variant="secondary">
            <p>The Advanced Query Builder</p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <CheckBox label="Remember my choice" checked={checked} onChange={handleChange} />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
