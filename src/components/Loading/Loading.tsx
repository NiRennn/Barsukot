import "./Loading.scss";
import Loader from "../Loader/Loader";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { useDispatch } from "react-redux";
import {
  setCurrentQuestion,
  setQuestions,
} from "../../store/slices/questionsSlice";
import { setAnswers, setCurrentAnswers } from "../../store/slices/answersSlice";
import { setFinals } from "../../store/slices/finalsSlice";

function Loading() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function parseQuery(queryString: string): any {
    let query: any = {};
    let pairs = (
      queryString[0] === "?" ? queryString.substr(1) : queryString
    ).split("&");
    for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
  }

  useEffect(() => {
    const app = (window as any)?.Telegram?.WebApp;

    const platform = window.Telegram.WebApp.platform;

    try {
      if (
        platform === "android" ||
        platform === "ios" ||
        platform === "android_x" ||
        platform === "unigram"
      ) {
        window.Telegram.WebApp.requestFullscreen();
      } else if (
        platform === "tdesktop" ||
        platform === "weba" ||
        platform === "webk" ||
        platform === "unknown"
      ) {
        window.Telegram.WebApp.exitFullscreen();
      }
      window.Telegram.WebApp.expand();
    } catch (e) {
      window.Telegram.WebApp.expand();
    }
    try {
      window.Telegram.WebApp.disableVerticalSwipes();
    } catch (e) {}

    const parseTgUserId = (): number | null => {
      try {
        const query = app?.initData ?? "";
        const user_data_str = parseQuery(query).user;
        const user_data = user_data_str ? JSON.parse(user_data_str) : null;
        const id = user_data?.id ? Number(user_data.id) : NaN;
        // const id = 5789474743;
        return Number.isFinite(id) ? id : null;
      } catch {
        return null;
      }
    };

    const getUserIdFromQuery = (): number | null => {
      try {
        const p = new URLSearchParams(window.location.search).get("user_id");
        const id = p ? Number(p) : NaN;
        return Number.isFinite(id) ? id : null;
      } catch {
        return null;
      }
    };

    app?.setHeaderColor("#f3f9ff");
    app?.setBackgroundColor("#f3f9ff");
    app?.setBottomBarColor("#f3f9ff");

    const effectiveUserId = parseTgUserId() ?? getUserIdFromQuery();

    let isCancelled = false;

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
        if (img.complete) resolve();
      });

    const criticalImages = [
      "/images/bg1.svg",
      "/images/blink-top.svg",
      "/images/blink-bot.svg",
    ];

    const loadData = async () => {
      try {
        if (!effectiveUserId) {
          console.warn(
            "Не удалось определить user_id (TG/URL). Пропускаю fetch."
          );
          navigate(appRoutes.STORY, { replace: true });
          return;
        }

        const [data] = await Promise.all([
          fetch(
            `https://barsukot.brandservicebot.ru/api/get_user_data/?user_id=${effectiveUserId}`
          ).then((r) => r.json()),
        ]);

        if (isCancelled) return;


        dispatch(setQuestions(data.questions));
        dispatch(setAnswers(data.answers));
        dispatch(setFinals(data.final_variants));

        const question = data.questions.find((q: any) => q.id === 53);
        dispatch(setCurrentQuestion(question));

        const answersForStart = (data.answers || []).filter(
          (a: any) => a.question_id === 53
        );
        dispatch(setCurrentAnswers(answersForStart));

        const imagesReady = Promise.all(criticalImages.map(preloadImage));
        const minDelay = new Promise<void>((res) => setTimeout(res, 1200));
        await Promise.all([imagesReady, minDelay]);

        if (isCancelled) return;
        navigate(appRoutes.STORY, { replace: true });
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        navigate(appRoutes.STORY, { replace: true });
      }
    };

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [dispatch, navigate]);

  return (
    <div className="loading">
      <div className="loading__overlay">
        <div className="loading__logo-kinopoisk">
          <img
            src="/images/BadgerCat2_logo+zverdetectiv.svg"
            alt="logo"
            className="loading__logo"
          />
          <img
            src="/images/селфпромо лайны.svg"
            alt="kinopoisk"
            className="loading__kinopoisk"
          />
        </div>

        <div className="loading__loader">
          <Loader />
        </div>
      </div>
    </div>
  );
}

export default Loading;
