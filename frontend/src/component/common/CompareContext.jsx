import React, { createContext, useContext, useState, useCallback } from "react";

const CompareContext = createContext(null);

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [list, setList] = useState([]);

  const toggle = useCallback((room) => {
    setList((prev) => {
      const already = prev.find((r) => r.id === room.id);
      if (already) return prev.filter((r) => r.id !== room.id);
      if (prev.length >= 3) return prev;
      return [...prev, room];
    });
  }, []);

  const isSelected = useCallback((id) => list.some((r) => r.id === id), [list]);
  const clear = useCallback(() => setList([]), []);

  return (
    <CompareContext.Provider value={{ list, toggle, isSelected, clear }}>
      {children}
    </CompareContext.Provider>
  );
};
