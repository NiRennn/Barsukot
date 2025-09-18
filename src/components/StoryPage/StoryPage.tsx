import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import TextAudio from "../../components/TextAudio/TextAudio";
import Button from "../../components/Button/Button";
import Choices from "../Choices/Choices";
import {
  setQuestions,
  setCurrentQuestion,
} from "../../store/slices/questionsSlice";
import { setAnswers, setCurrentAnswers } from "../../store/slices/answersSlice";
import { setFinals, selectFinals } from "../../store/slices/finalsSlice";

import "./StoryPage.scss";
import AgainButton from "../AgainButton/AgainButton";

type ID = number | string;

export interface QuestionBtn {
  id: ID;
  text: string;
  url?: string | null;
  logo?: string | null;
}

export interface Question {
  id: ID;
  text: string;
  audio?: string | null;
  picture?: string | null;
  order?: number | null;
  final?: boolean;
  btns?: QuestionBtn[]; // кнопки из БД на финальном экране
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
  finals: {
    list: {
      id: ID;
      text: string;
      audio?: string | null;
      order?: number | null;
    }[];
  };
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

const parseQuery = (queryString: string): any => {
  const query: any = {};
  const pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
};

const getEffectiveUserId = (): number | null => {
  try {
    const app = (window as any)?.Telegram?.WebApp;
    const query = app?.initData ?? "";
    const user_data_str = parseQuery(query).user;
    const user_data = user_data_str ? JSON.parse(user_data_str) : null;
    const idFromTg = user_data?.id ? Number(user_data.id) : NaN;
    if (Number.isFinite(idFromTg)) return idFromTg;
  } catch {}

  try {
    const p = new URLSearchParams(window.location.search).get("user_id");
    const idFromQuery = p ? Number(p) : NaN;
    if (Number.isFinite(idFromQuery)) return idFromQuery;
  } catch {}

  return null;
};

const STORAGE_KEY = "barsukot.currentQuestionId";

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
            (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER)
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
  const isFinalQuestion = !!currentQuestion?.final;

  useEffect(() => {
    const t = setTimeout(() => setIsOpeningOnMount(true), 30);
    return () => clearTimeout(t);
  }, []);

useEffect(() => {
  if (questionsList.length > 0) return;

  let cancelled = false;
  const userId = getEffectiveUserId();
  if (!userId) {
    console.warn("StoryPage bootstrap: user_id не найден, пропускаю загрузку.");
    return;
  }

  const load = async () => {
    try {
      const res = await fetch(
        `https://barsukot.brandservicebot.ru/api/get_user_data/?user_id=${userId}`
      );
      const data = await res.json();
      if (cancelled) return;

      dispatch(setQuestions(data.questions));
      dispatch(setAnswers(data.answers));
      dispatch(setFinals(data.final_variants));

      const savedIdStr = sessionStorage.getItem("barsukot.currentQuestionId");
      const savedId = savedIdStr ? Number(savedIdStr) : NaN;
      const byId = data.questions.find((q: any) => q.id === savedId);
      const byOrder = [...data.questions].sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
      )[0];
      const startQ = byId || byOrder;

      dispatch(setCurrentQuestion(startQ));
      dispatch(setCurrentAnswers((data.answers || []).filter(
        (a: any) => a.question_id === startQ.id
      )));
    } catch (e) {
      console.error("Bootstrap fetch failed:", e);
    }
  };

  load();
  return () => { cancelled = true; };
}, [questionsList.length, dispatch]);


  useEffect(() => {
    if (currentQuestion?.id != null) {
      sessionStorage.setItem(STORAGE_KEY, String(currentQuestion.id));
    }
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!questionsList.length || currentQuestion) return;

    const savedIdStr = sessionStorage.getItem(STORAGE_KEY);
    const savedId = savedIdStr ? Number(savedIdStr) : NaN;

    const fallback = [...questionsList].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )[0];

    const q =
      (Number.isFinite(savedId) &&
        questionsList.find((qq) => qq.id === savedId)) ||
      fallback;

    if (q) {
      dispatch(setCurrentQuestion(q));
      dispatch(
        setCurrentAnswers(
          (answersList || []).filter((a) => a.question_id === q.id)
        )
      );
    }
  }, [questionsList, currentQuestion, answersList, dispatch]);

  const gotoQuestionByOrder = useCallback(
    (orderValue: number) => {
      const nextQuestion = questionsList.find(
        (q) => (q.order ?? null) === orderValue
      );
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

  const restartToFirst = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => {
      const first = [...questionsList].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      )[0];
      if (!first) {
        console.warn("Не найден стартовый вопрос (минимальный order).");
        setIsBlinking(false);
        return;
      }
      const firstAnswers = (answersList || []).filter(
        (a) => a.question_id === first.id
      );
      dispatch(setCurrentQuestion(first));
      dispatch(setCurrentAnswers(firstAnswers));
      setIsBlinking(false);
    }, 700);
  }, [answersList, dispatch, questionsList]);

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
  const effectiveAudio = isFinalFlow
    ? finalSlide?.audio ?? null
    : questionAudio;

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

  const renderFinalButtons = () => {
    const btns = currentQuestion?.btns || [];
    if (!btns.length) return null;

    return (
      <div className="unified__final-buttons">
        {btns.map((b) => {
          if (b.url) {
            const onClick = () =>
              window.open(b.url!, "_blank", "noopener,noreferrer");
            return (
              <Button
                key={`btn-${String(b.id)}`}
                text={b.text}
                onClick={onClick}
              />
            );
          }
          return (
            <AgainButton
              key={`btn-${String(b.id)}`}
              text={b.text}
              onClick={restartToFirst}
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
          {isFinalQuestion ? (
            renderFinalButtons()
          ) : isFinalFlow ? (
            <Button
              text={
                finalIdx + 1 < sortedFinals.length
                  ? "Продолжить"
                  : "К вариантам"
              }
              onClick={advanceFinalFlow}
            />
          ) : isSingle ? (
            <Button
              text={answersArray[0]?.text ?? ""}
              onClick={handleSingleClick}
            />
          ) : (
            <Choices answers={answersArray} onSelect={handleChoiceClick} />
          )}
        </div>
      )}
    </div>
  );
};

export default StoryPage;
