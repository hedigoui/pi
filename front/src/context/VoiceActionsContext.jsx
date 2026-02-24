import { createContext, useContext, useState, useCallback } from 'react';

const VoiceActionsContext = createContext(null);

export function VoiceActionsProvider({ children }) {
  const [pageActions, setPageActionsState] = useState({});
  const setPageActions = useCallback((actions) => {
    setPageActionsState(actions ?? {});
  }, []);

  return (
    <VoiceActionsContext.Provider value={{ pageActions, setPageActions }}>
      {children}
    </VoiceActionsContext.Provider>
  );
}

export function usePageActions() {
  const ctx = useContext(VoiceActionsContext);
  return ctx?.pageActions ?? {};
}

export function useSetPageActions() {
  const ctx = useContext(VoiceActionsContext);
  return ctx?.setPageActions ?? (() => {});
}
