"use client";

import { createContext, useContext, useState } from "react";

interface ProgramActionContextProps {
  isMutating: boolean;
  setIsMutating: (value: boolean) => void;
}

const ProgramActionContext = createContext<ProgramActionContextProps | null>(
  null,
);

export const ProgramActionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMutating, setIsMutating] = useState(false);

  return (
    <ProgramActionContext.Provider value={{ isMutating, setIsMutating }}>
      {children}
    </ProgramActionContext.Provider>
  );
};

export const useProgramAction = () => {
  const context = useContext(ProgramActionContext);
  if (!context)
    throw new Error(
      "useProgramAction must be used within ProgramActionProvider",
    );
  return context;
};
