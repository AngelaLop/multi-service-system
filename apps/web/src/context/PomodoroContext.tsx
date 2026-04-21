"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

interface PomodoroState {
  eventId: string | null;
  timeRemaining: number;
  running: boolean;
}

type PomodoroAction =
  | { type: "START"; payload: string }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "TICK" };

const initialState: PomodoroState = {
  eventId: null,
  timeRemaining: 25 * 60,
  running: false,
};

function reducer(state: PomodoroState, action: PomodoroAction): PomodoroState {
  switch (action.type) {
    case "START":
      return { eventId: action.payload, timeRemaining: 25 * 60, running: true };
    case "PAUSE":
      return { ...state, running: false };
    case "RESUME":
      return { ...state, running: true };
    case "STOP":
      return { ...initialState };
    case "TICK":
      if (!state.running || state.timeRemaining <= 0) return state;
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    default:
      return state;
  }
}

const PomodoroContext = createContext<{
  state: PomodoroState;
  dispatch: React.Dispatch<PomodoroAction>;
} | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <PomodoroContext.Provider value={{ state, dispatch }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider");
  return ctx;
}
