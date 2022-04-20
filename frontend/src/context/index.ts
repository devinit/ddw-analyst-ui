import { SourceMap } from '../types/sources';
import { List } from 'immutable';
import { createContext } from 'react';
import { UserState } from '../reducers/user';
import { TokenState } from '../reducers/token';
import { OperationMap } from '../types/operations';

export const AppContext = createContext<
  Partial<{
    user: UserState;
    token: TokenState;
    activeOperation: OperationMap;
    onUpdateActiveOperation: (operation: OperationMap) => void;
  }>
>({});
export const SourcesContext = createContext<{ sources: List<SourceMap> }>({ sources: List() });
