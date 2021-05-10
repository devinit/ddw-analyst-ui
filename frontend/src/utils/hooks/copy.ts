import React from 'react';
import copy from 'copy-to-clipboard';

export type CopyToClipboardType = (boolean | ((text: string) => void))[];

export default function useCopyToClipboard(resetInterval: number): CopyToClipboardType {
  const [isCopied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback((text: string) => {
    if (typeof text === 'string' || typeof text === 'number') {
      copy(text.toString());
      setCopied(true);
    } else {
      setCopied(false);
      console.error(`Cannot copy typeof ${typeof text} to clipboard, must be a string or number.`);
    }
  }, []);

  React.useEffect(() => {
    let timeout: number;
    if (isCopied && resetInterval) {
      timeout = window.setTimeout(() => setCopied(false), resetInterval);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied, resetInterval]);

  return [isCopied, handleCopy];
}
