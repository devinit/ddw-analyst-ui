import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { Alert, Modal } from 'react-bootstrap';
import { ChangePasswordFields, ChangePasswordForm } from '../ChangePasswordForm';
import * as ModalActions from '../../actions/modal';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { api } from '../../utils';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
interface ActionProps {
  actions: typeof ModalActions;
}
interface ReduxProps {
  token?: TokenState;
}
type AccountModalProps = ActionProps & ReduxProps;

const AccountModal: React.SFC<AccountModalProps> = (props) => {
  const [ alert, setAlert ] = React.useState<React.ReactNode>('');
  const [ errors, setErrors ] = React.useState<Partial<ChangePasswordFields>>({});

  const onSuccess = (values: ChangePasswordFields) => {
    const { token } = props;
    if (token) {
      axios.request({
        url: api.routes.CHANGE_PASSWORD,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${token}`
        },
        data: values
      })
      .then((response: AxiosResponse<string>) => {
        if (response.status === 204) {
          setAlert(<p>Your session has expired. <a href="/login/">Login</a></p>);
        }
        props.actions.toggleModal();
      })
      .catch(error => {
        const { data, status } = error.response;
        if (status === 400 && data.validation) {
          const { old_password, new_password1, new_password2 } = data.validation;
          const validationErrors = {
            old_password,
            new_password1,
            new_password2
          };
          setErrors(validationErrors);
        }
        console.log(error); //tslint:disable-line
      });
    }
  };

  return (
    <React.Fragment>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {
          alert
            ? <Alert variant="danger">{ alert }</Alert>
            : <ChangePasswordForm onSuccess={ onSuccess } errors={ errors }/>
        }
      </Modal.Body>
    </React.Fragment>
  );
};

const mapStateToProps = (reduxStore: ReduxStore): ReduxProps => ({
  token: reduxStore.get('token') as TokenState
});
const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators(ModalActions, dispatch)
});
const ReduxConnector = connect(mapStateToProps, mapDispatchToProps)(AccountModal);

export { ReduxConnector as AccountModal, ReduxConnector as default };
