import { HIDE_MODAL, ModalAction, SHOW_MODAL } from '../reducers/modal';

export const toggleModal = (modal?: React.ElementType, size?: 'lg' | 'sm'): ModalAction =>
  modal ? ({ type: SHOW_MODAL, modal, size }) : ({ type: HIDE_MODAL });
