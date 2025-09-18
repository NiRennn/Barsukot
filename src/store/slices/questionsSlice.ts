import { createSlice } from "@reduxjs/toolkit";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface QuestionsState {
  list: [];
  currentQuestion: [] | null;
  status: Status;
  error: string | null;
}

const initialState: QuestionsState = {
  list: [],
  currentQuestion: null,
  status: "idle",
  error: null,
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.list = action.payload || [];
      state.status = "succeeded";
      state.error = null;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload || null;
    },
    setQuestionsLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setQuestionsError: (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Unknown error";
    },
    resetQuestions: (state) => {
      state.list = [];
      state.currentQuestion = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  setQuestions,
  setCurrentQuestion,
  setQuestionsLoading,
  setQuestionsError,
  resetQuestions,
} = questionsSlice.actions;

export default questionsSlice.reducer;

export const selectQuestions = (state: any) => state.questions.list;
export const selectCurrentQuestion = (state: any) => state.questions.currentQuestion;
export const selectQuestionsStatus = (state: any) => state.questions.status;
export const selectQuestionsError = (state: any) => state.questions.error;
