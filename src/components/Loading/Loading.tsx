import "./Loading.scss";
import Loader from "../Loader/Loader";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { useDispatch } from "react-redux";
import {
  setCurrentQuestion,
  setQuestions
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

    let app = window.Telegram.WebApp;
    let query = app.initData;
    let user_data_str = parseQuery(query).user;
    let user_data = JSON.parse(user_data_str);
    app.setHeaderColor("#f3f9ff");
    app.setBackgroundColor("#f3f9ff");
    app.setBottomBarColor("#f3f9ff");
    let userChatId: any = user_data["id"];
    // let userChatId: number = 5789474743;

 

    const fetchQuestionsAnswers = async () => {
      try {
        const result = await fetch(
          `https://barsukot.brandservicebot.ru/api/get_user_data/?user_id=${userChatId}`
        );
        const data = await result.json();

        dispatch(setQuestions(data.questions));
        dispatch(setAnswers(data.answers));
        dispatch(setFinals(data.final_variants));


        const question = data.questions.find((q: any) => q.id === 53);
        dispatch(setCurrentQuestion(question));

        const answersForStart = (data.answers || []).filter(
          (a: any) => a.question_id === 53
        );
        dispatch(setCurrentAnswers(answersForStart));

        setTimeout(() => {
          navigate(appRoutes.STORY, { replace: true });
        }, 3000);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    fetchQuestionsAnswers();
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
