import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './slices/questionsSlice';
import answersReducer from './slices/answersSlice';
import finalsReducer from './slices/finalsSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    answers: answersReducer,
    finals: finalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
