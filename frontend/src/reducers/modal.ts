import { Action, Reducer } from 'redux';
import { Map, fromJS } from 'immutable';

export type ModalAction = Action & Modal;

export interface Modal {
  modal?: React.ElementType;
  size?: 'lg' | 'sm';
}
export type ModalState = Map<keyof Modal, Modal[keyof Modal]>;

const prefix = 'modal';
export const SHOW_MODAL = `${prefix}.SHOW_MODAL`;
export const HIDE_MODAL = `${prefix}.HIDE_MODAL`;

const defaultState: ModalState = fromJS({});

export const modalReducer: Reducer<ModalState, ModalAction> = (state = defaultState, action) => {
    if (action.type === SHOW_MODAL && action.modal) {
        return state.withMutations(modal =>
          modal.set('modal', action.modal).set('size', action.size)
        );
    }
    if (action.type === HIDE_MODAL) {
        return state.remove('modal').remove('size');
    }

    return state;
};
