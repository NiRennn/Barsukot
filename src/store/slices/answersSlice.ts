import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  currentAnswers: [],
  status: "idle",
  error: null,
};

const answersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    setAnswers: (state, action) => {
      state.list = action.payload || [];
      state.status = "succeeded";
      state.error = null;
    },
    setCurrentAnswers: (state, action) => {
      const payload = action.payload;
      state.currentAnswers = Array.isArray(payload)
        ? payload
        : (payload ? [payload] : []);
    },
    setAnswersLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setAnswersError: (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Unknown error";
    },
    resetAnswers: (state) => {
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

export const selectAnswers = (state) => state.answers.list;
export const selectCurrentAnswers = (state) => state.answers.currentAnswers;
export const selectAnswersStatus = (state) => state.answers.status;
export const selectAnswersError = (state) => state.answers.error;
