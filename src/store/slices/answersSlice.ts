import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface Answer {
  id: number | string;
  question_id: number | string;
  text: string;
  next_question_id?: number | string | null;
  send_variants?: boolean | null;
  logo?: string | null;
}

interface AnswersState {
  list: Answer[];
  currentAnswers: Answer[];
  status: Status;
  error: string | null;
}

const initialState: AnswersState = {
  list: [],
  currentAnswers: [],
  status: "idle",
  error: null,
};

const answersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    setAnswers(state, action: PayloadAction<Answer[] | undefined>) {
      state.list = action.payload ?? [];
      state.status = "succeeded";
      state.error = null;
    },
    setCurrentAnswers(
      state,
      action: PayloadAction<Answer[] | Answer | null | undefined>
    ) {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.currentAnswers = payload;
      } else if (payload) {
        state.currentAnswers = [payload];
      } else {
        state.currentAnswers = [];
      }
    },
    setAnswersLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setAnswersError(state, action: PayloadAction<string | null | undefined>) {
      state.status = "failed";
      state.error = action.payload ?? "Unknown error";
    },
    resetAnswers(state) {
      state.list = [];
      state.currentAnswers = [];
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  setAnswers,
  setCurrentAnswers,
  setAnswersLoading,
  setAnswersError,
  resetAnswers,
} = answersSlice.actions;

export default answersSlice.reducer;

// селекторы
export const selectAnswers = (state: any) => state.answers.list;
export const selectCurrentAnswers = (state: any) =>
  state.answers.currentAnswers;
export const selectAnswersStatus = (state: any) => state.answers.status;
export const selectAnswersError = (state: any) => state.answers.error;
