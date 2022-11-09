import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext } from "react";
import { Question, SurverySaysContext } from "../App";
import { Button } from "@tremor/react";

import { firebaseContext } from "../context/firebase";

export const Controls = () => {
  const { db } = useContext(firebaseContext);
  const {
    questions,
    currentQuestion,
    currentQuestionId,
    currentRound,
    currentState,
  } = useContext(SurverySaysContext);

  const handleOnNextQuestion = async () => {
    if (!currentQuestion || !currentQuestionId) return;

    const nextNumber = currentQuestion.number + 1;
    // Update active question to false
    const docRef = doc(db, "questions", currentQuestionId);
    await updateDoc(docRef, {
      active: false,
    });

    const q = query(
      collection(db, "questions"),
      where("number", "==", nextNumber),
      where("round", "==", currentRound)
    );
    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (question) => {
        await updateDoc(question.ref, {
          active: true,
        });
      });
    });
  };

  const handleOnPrevQuestion = async () => {
    if (!currentQuestion || !currentQuestionId || currentQuestion.number === 1)
      return;

    const prevNumber = currentQuestion.number - 1;
    // Update active question to false
    const docRef = doc(db, "questions", currentQuestionId);
    await updateDoc(docRef, {
      active: false,
    });

    const q = query(
      collection(db, "questions"),
      where("number", "==", prevNumber)
    );
    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (question) => {
        await updateDoc(question.ref, {
          active: true,
        });
      });
    });
  };

  const handleOnReveal = async (top: number) => {
    if (currentState === 0) return;

    if (!currentQuestion || !currentQuestionId) return;

    const docRef = doc(db, "questions", currentQuestionId);

    const newAnswers = currentQuestion.answers.map((answer) => {
      if (answer.top === top) {
        if (!answer.revealed) {
          addDoc(collection(db, "answers"), {
            value: "correct",
            questionId: currentQuestionId,
          });
        }

        return {
          ...answer,
          revealed: !answer.revealed,
        };
      }

      return answer;
    });

    await updateDoc(docRef, {
      answers: newAnswers,
    });
  };

  const handleOnWrongAnswer = () => {
    if (currentState === 0) return;

    addDoc(collection(db, "answers"), {
      value: "wrong",
      questionId: currentQuestionId,
    });
  };

  const handleOnStateChange = (state: 0 | 1 | 2) => {
    const docRef = doc(db, "game", "state");
    updateDoc(docRef, {
      state,
    });
  };

  const handleOnResetRound = (round?: number) => {
    const questionsQuery = query(
      collection(db, "questions"),
      where("round", "==", round ? round : currentRound)
    );

    getDocs(questionsQuery).then((response) => {
      response.forEach(async (result) => {
        const question = result.data() as Question;

        if (question.number === 1) {
          await updateDoc(result.ref, {
            active: true,
            answers: question.answers.map((answer) => ({
              ...answer,
              revealed: false,
            })),
          });
        } else {
          await updateDoc(result.ref, {
            active: false,
            answers: question.answers.map((answer) => ({
              ...answer,
              revealed: false,
            })),
          });
        }
      });
    });
  };

  const handleOnRoundChange = (round: number) => {
    const docRef = doc(db, "game", "state");
    updateDoc(docRef, {
      round,
      state: 0,
    });

    handleOnResetRound(round);
  };

  const handleOnRoundStartStop = () => {
    if (currentState === 1) {
      if (
        window.confirm(`Are you sure you want to Stop Round ${currentRound}?`)
      ) {
        handleOnResetRound();
        handleOnStateChange(0);
      }

      return;
    }

    handleOnStateChange(1);
  };

  const handleOnStartGame = () => {
    if (currentState === 2) {
      if (window.confirm(`Are you sure you want to Start Game?`)) {
        handleOnStateChange(0);
      }
    }
  };

  const handleOnStopGame = () => {
    if (window.confirm(`Are you sure you want to Stop Game?`)) {
      handleOnResetRound();
      handleOnStateChange(2);
    }
  };

  if (!currentQuestion) return null;

  return (
    <main className="h-screen flex justify-center items-center gap-6 flex-col">
      {currentState === 2 ? (
        <div>
          <button
            className="h-12 px-6 font-semibold text-white rounded-lg bg-green-500"
            onClick={() => handleOnStartGame()}
          >
            START THE GAME
          </button>
        </div>
      ) : (
        <>
          <div className="w-[800px] border-4 border-gray-700 rounded-xl p-5 flex gap-4 items-center">
            <h3 className="font-bold text-sm m-0">ROUNDS</h3>
            <button
              className={`h-12 font-semibold text-white rounded-lg px-4 ${
                currentRound === 1 ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => handleOnRoundChange(1)}
              disabled={currentRound === 1}
            >
              ROUND 1
            </button>
            <button
              className={`h-12 font-semibold text-white rounded-lg px-4 ${
                currentRound === 2 ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => handleOnRoundChange(2)}
              disabled={currentRound === 2}
            >
              ROUND 2
            </button>
            <button
              className={`h-12 font-semibold text-white rounded-lg px-4 ${
                currentRound === 3 ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => handleOnRoundChange(3)}
              disabled={currentRound === 3}
            >
              ROUND 3
            </button>
          </div>

          <div className="w-[800px] border-4 border-gray-700 rounded-xl p-5">
            <h3 className="font-bold text-sm m-0">
              QUESTION {currentQuestion?.number} OUT OF {questions.length}
            </h3>
            <h3 className="font-bold text-lg m-0">
              {currentQuestion?.question}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 w-[800px]">
            <div className=" border-4 border-gray-700 rounded-xl relative">
              {currentState === 0 && (
                <div className="absolute bg-black bg-opacity-60 w-full h-full z-10"></div>
              )}
              <div className="p-5 grid grid-cols-1 gap-4">
                {currentQuestion?.answers.map((answer) => (
                  <div
                    className="bg-blue-400 h-12 rounded-lg flex items-center font-semibold text-white cursor-pointer relative"
                    key={answer.top}
                    onClick={() => handleOnReveal(answer.top)}
                  >
                    {!answer.revealed && (
                      <div className="absolute w-full h-full  rounded-lg bg-black bg-opacity-30"></div>
                    )}
                    <div className="px-4 flex justify-between w-full">
                      <div>
                        {answer.top}. {answer.title.toUpperCase()}
                      </div>
                      <div>{answer.score}</div>
                    </div>
                  </div>
                ))}
                <div
                  className="h-12 rounded-lg grid place-content-center font-semibold text-white relative bg-red-500 hover:bg-red-600 cursor-pointer"
                  key="wrong-answer"
                  onClick={() => handleOnWrongAnswer()}
                >
                  Wrong Answer
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between border-4 border-gray-700 rounded-xl p-5">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-2 w-full">
                  <button
                    className={`h-12 font-semibold rounded-lg ${
                      currentState === 1
                        ? "border-2 border-red-500 hover:bg-red-600 text-red-600 hover:text-white"
                        : "bg-green-500 text-white"
                    }`}
                    onClick={() => handleOnRoundStartStop()}
                  >
                    {currentState === 1
                      ? `STOP ROUND ${currentRound}`
                      : `START ROUND ${currentRound}`}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    className={` h-12 font-semibold text-white rounded-lg ${
                      currentQuestion?.number === 1 || currentState === 0
                        ? "bg-blue-300"
                        : "bg-blue-500"
                    }`}
                    onClick={() => handleOnPrevQuestion()}
                    disabled={
                      currentQuestion?.number === 1 || currentState === 0
                    }
                  >
                    PREV QUESTION
                  </button>

                  <button
                    className={` h-12 font-semibold text-white rounded-lg ${
                      (currentQuestion &&
                        currentQuestion?.number >= questions.length) ||
                      currentState === 0
                        ? "bg-blue-300"
                        : "bg-blue-500"
                    }`}
                    onClick={() => handleOnNextQuestion()}
                    disabled={
                      (currentQuestion &&
                        currentQuestion?.number >= questions.length) ||
                      currentState === 0
                    }
                  >
                    NEXT QUESTION
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 w-full">
                <button
                  className="h-12 font-semibold text-white rounded-lg bg-slate-400 hover:bg-red-500"
                  onClick={() => handleOnStopGame()}
                >
                  STOP THE GAME
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};
