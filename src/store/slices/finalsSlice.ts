import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export type ID = number | string;

export interface FinalVariant {
  id: ID;
  text: string;
  audio?: string | null;
  picture?: string  | null;
  order?: number | null; 
}

export interface FinalsState {
  list: FinalVariant[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FinalsState = {
  list: [],
  status: "idle",
  error: null,
};

const finalsSlice = createSlice({
  name: "finals",
  initialState,
  reducers: {
    setFinals: (state, action: PayloadAction<FinalVariant[] | undefined>) => {
      state.list = action.payload ?? [];
      state.status = "succeeded";
      state.error = null;
    },
    setFinalsLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setFinalsError: (state, action: PayloadAction<string | undefined>) => {
      state.status = "failed";
      state.error = action.payload ?? "Unknown error";
    },
    resetFinals: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  setFinals,
  setFinalsLoading,
  setFinalsError,
  resetFinals,
} = finalsSlice.actions;

export default finalsSlice.reducer;

// selectors
export const selectFinals = (state: any): FinalVariant[] => state.finals.list;
export const selectFinalsStatus = (state: any) => state.finals.status;
export const selectFinalsError = (state: any) => state.finals.error;
