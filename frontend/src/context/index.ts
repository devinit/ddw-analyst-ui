import { SourceMap } from '../types/sources';
import { List } from 'immutable';
import { createContext } from 'react';

export const SourcesContext = createContext<{ sources: List<SourceMap> }>({ sources: List() });
