import React, { FunctionComponent, useState, createContext, useContext, ReactNode } from 'react';

type CopyProviderProps = { children: ReactNode };
type OperationCopyType = {
  isCopy: boolean;
  setIsCopy: (isCopy: boolean) => void;
};
const OperationCopyContext = createContext<OperationCopyType | undefined>(undefined);

const CopyProvider: FunctionComponent = ({ children }: CopyProviderProps) => {
  const [isCopy, setIsCopy] = useState(false);
  const value = { isCopy, setIsCopy };

  return <OperationCopyContext.Provider value={value}>{children}</OperationCopyContext.Provider>;
};

const useCopy = (): OperationCopyType => {
  const context = useContext(OperationCopyContext);
  if (context === undefined) {
    throw new Error('useCopy must be used within a CopyProvider');
  }

  return context;
};

export { CopyProvider, useCopy };
