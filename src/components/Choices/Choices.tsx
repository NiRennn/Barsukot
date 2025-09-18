import React from "react";
import "./Choices.scss";

type ID = number | string;

export interface Answer {
  id: ID;
  question_id: ID;
  text: string;
  next_question_id?: ID | null;
  logo: string;
}

interface ChoicesProps {
  answers: Answer[];
  onSelect: (answer: Answer) => void;
}

const Choices: React.FC<ChoicesProps> = ({ answers, onSelect }) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return <div className="choices__empty">Нет доступных ответов</div>;
  }

  return (
    <div className="choices" role="list">
      {answers.map((answer, index) => (
        <button
          key={String(answer.id ?? answer.text)}
          type="button"
          className="choices__button"
          onClick={() => onSelect(answer)}
        >
          {index === 0 && (
            <img
              src="/icons/Tooltip.svg"
              alt="tooltip"
              className="choices__tooltip"
            />
          )}
          <div className="choices__button-content">
            <img
              src={`https://barsukot.brandservicebot.ru${answer.logo}`}
              alt=""
              className="choices__button-icon"
            />
            <p className="choices__button-text">{answer?.text ?? ""}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default Choices;
