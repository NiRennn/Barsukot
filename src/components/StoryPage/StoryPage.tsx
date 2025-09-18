import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import TextAudio from "../../components/TextAudio/TextAudio";
import Button from "../../components/Button/Button";
import Choices from "../Choices/Choices";
import { setCurrentAnswers } from "../../store/slices/answersSlice";
import { setCurrentQuestion } from "../../store/slices/questionsSlice";
import { selectFinals } from "../../store/slices/finalsSlice";
import "./StoryPage.scss";

type ID = number | string;

export interface Question {
  id: ID;
  text: string;
  audio?: string | null;
  picture?: string | null;
  order?: number | null;
  final?: boolean;
}
export interface Answer {
  id: ID;
  question_id: ID;
  text: string;
  next_question_id?: ID | null;
  send_variants?: boolean | null;
  logo?: string | null;
}
export interface QuestionsState {
  currentQuestion: Question | null;
  list: Question[];
}
export interface AnswersState {
  currentAnswers: Answer[];
  list: Answer[];
}
export interface RootState {
  questions: QuestionsState;
  answers: AnswersState;
  finals: { list: { id: ID; text: string; audio?: string | null; order?: number | null }[] };
}

type AppDispatch = any;

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
const useAppDispatch: () => AppDispatch =
  useDispatch as unknown as () => AppDispatch;

const makeAbsolute = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `https://barsukot.brandservicebot.ru${path}`;
};

const StoryPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { currentQuestion, list: questionsList } = useAppSelector(
    (state) => state.questions
  );
  const { currentAnswers, list: answersList } = useAppSelector(
    (state) => state.answers
  );
  const finalsList = useAppSelector(selectFinals);

  const [isOpeningOnMount, setIsOpeningOnMount] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const [isFinalFlow, setIsFinalFlow] = useState(false);
  const [finalIdx, setFinalIdx] = useState(0);

  const sortedFinals = useMemo(
    () =>
      (finalsList || [])
        .slice()
        .sort(
          (a, b) =>
            (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
        ),
    [finalsList]
  );

  const questionText = currentQuestion?.text ?? "";
  const questionAudio = currentQuestion?.audio ?? null;
  const questionPicture = currentQuestion?.picture ?? null;
  const questionOrder = currentQuestion?.order ?? null;

  const answersArray: Answer[] = Array.isArray(currentAnswers)
    ? currentAnswers
    : [];
  const isSingle = answersArray.length === 1;

  const isVersionSelect = questionOrder === 10;

  useEffect(() => {
    const t = setTimeout(() => setIsOpeningOnMount(true), 30);
    return () => clearTimeout(t);
  }, []);

  const gotoQuestionByOrder = useCallback(
    (orderValue: number) => {
      const nextQuestion = questionsList.find((q) => (q.order ?? null) === orderValue);
      if (!nextQuestion) {
        console.warn(`Не найден вопрос с order = ${orderValue}`);
        return false;
      }
      const nextAnswers = (answersList || []).filter(
        (a) => a.question_id === nextQuestion.id
      );
      dispatch(setCurrentQuestion(nextQuestion));
      dispatch(setCurrentAnswers(nextAnswers));
      return true;
    },
    [answersList, dispatch, questionsList]
  );

  const startFinalFlow = useCallback(() => {
    if (!sortedFinals.length) {
      gotoQuestionByOrder(10);
      return;
    }
    setIsFinalFlow(true);
    setFinalIdx(0);
  }, [gotoQuestionByOrder, sortedFinals]);

  const advanceFinalFlow = useCallback(() => {
    const next = finalIdx + 1;
    if (next < sortedFinals.length) {
      setFinalIdx(next);
      return;
    }
    setIsFinalFlow(false);
    gotoQuestionByOrder(10);
  }, [finalIdx, gotoQuestionByOrder, sortedFinals.length]);

  const goToNext = useCallback(
    (answer?: Answer) => {
      if (!answer) return;
      setIsBlinking(true);

      setTimeout(() => {
        const nextQuestionId = answer.next_question_id;

        if (nextQuestionId == null) {
          setIsBlinking(false);
          startFinalFlow();
          return;
        }

        const nextQuestion = questionsList.find((q) => q.id === nextQuestionId);
        if (!nextQuestion) {
          console.warn("Не найден следующий вопрос по id:", nextQuestionId);
          setIsBlinking(false);
          return;
        }

        const nextAnswers = (answersList || []).filter(
          (a) => a.question_id === nextQuestion.id
        );

        dispatch(setCurrentQuestion(nextQuestion));
        dispatch(setCurrentAnswers(nextAnswers));

        setIsBlinking(false);
      }, 700);
    },
    [answersList, dispatch, questionsList, startFinalFlow]
  );

  const handleSingleClick = () => goToNext(answersArray[0]);
  const handleChoiceClick = (answer: Answer) => goToNext(answer);

  const finalSlide = isFinalFlow ? sortedFinals[finalIdx] : null;
  const effectiveText = isFinalFlow ? finalSlide?.text ?? "" : questionText;
  const effectiveAudio = isFinalFlow ? finalSlide?.audio ?? null : questionAudio;

  const renderVersionImageButtons = () => {
    if (!answersArray.length) return null;
    return (
      <div className="unified__versions">
        {answersArray.map((ans) => {
          const src = makeAbsolute(ans.logo || null);
          const label = ans.text || "Вариант";
          if (!src) {
            return (
              <button
                key={String(ans.id)}
                className="unified__version-fallbackButton"
                onClick={() => handleChoiceClick(ans)}
                type="button"
                aria-label={label}
                title={label}
              >
                {label}
              </button>
            );
          }
          return (
            <input
              key={String(ans.id)}
              type="image"
              alt={label}
              title={label}
              src={src}
              className="unified__version-imageButton"
              onClick={(e) => {
                e.preventDefault();
                handleChoiceClick(ans);
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={[
        "unified",
        isOpeningOnMount ? "unified--open" : "",
        isBlinking ? "unified--blink" : "",
      ].join(" ")}
    >
      <div className="eyelid eyelid--top" aria-hidden="true" />
      <div className="eyelid eyelid--bottom" aria-hidden="true" />

      <img
        src="/images/BadgerCat2_logo+zverdetectiv.svg"
        alt="Barsukot-Logo"
        className="unified__logo"
        loading="eager"
        decoding="async"
      />

      <div className="unified__content-block">
        {!isFinalFlow && !isVersionSelect && questionPicture ? (
          <img
            src={makeAbsolute(questionPicture) || ""}
            alt="Barsukot-story-image"
            className="unified__story-image"
            loading="lazy"
            decoding="async"
          />
        ) : null}

        <TextAudio text={effectiveText} audio={effectiveAudio} />

        {isVersionSelect ? renderVersionImageButtons() : null}
      </div>

      {!isVersionSelect && (
        <div className="unified__answer-block">
          {isFinalFlow ? (
            <Button
              text={finalIdx + 1 < sortedFinals.length ? "Продолжить" : "К вариантам"}
              onClick={advanceFinalFlow}
            />
          ) : isSingle ? (
            <Button text={answersArray[0]?.text ?? ""} onClick={handleSingleClick} />
          ) : (
            <Choices answers={answersArray} onSelect={handleChoiceClick} />
          )}
        </div>
      )}
    </div>
  );
};

export default StoryPage;
