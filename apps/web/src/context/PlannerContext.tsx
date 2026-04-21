"use client";

import {
  createContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { PlannerState, PlannerAction } from "@/types";
import { todayString } from "@/lib/dates";

const initialState: PlannerState = {
  selectedDate: todayString(),
};

function plannerReducer(
  state: PlannerState,
  action: PlannerAction
): PlannerState {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
}

export const PlannerContext = createContext<{
  state: PlannerState;
  dispatch: Dispatch<PlannerAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(plannerReducer, initialState);

  return (
    <PlannerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlannerContext.Provider>
  );
}
