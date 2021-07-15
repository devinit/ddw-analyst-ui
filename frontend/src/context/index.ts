import { SourceMap } from '../types/sources';
import { List } from 'immutable';
import { createContext } from 'react';
import { UserState } from '../reducers/user';
import { TokenState } from '../reducers/token';

export const AppContext = createContext<Partial<{ user: UserState; token: TokenState }>>({});
export const SourcesContext = createContext<{ sources: List<SourceMap> }>({ sources: List() });
