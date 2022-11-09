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
import { SurverySaysContext } from "../App";
import { Button } from "@tremor/react";

import { firebaseContext } from "../context/firebase";

import correctSoundFX from "../assets/correct.mp3";
import wrongSoundFX from "../assets/wrong.mp3";
export const Controls = () => {
  let correct = new Audio(correctSoundFX);
  let wrong = new Audio(wrongSoundFX);

  const { db } = useContext(firebaseContext);
  const { questions, currentQuestion, currentQuestionId, currentRound } =
    useContext(SurverySaysContext);

  const handleOnNextRound = async () => {
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

  const handleOnPrevRound = async () => {
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
    if (!currentQuestion || !currentQuestionId) return;

    const docRef = doc(db, "questions", currentQuestionId);

    const newAnswers = currentQuestion.answers.map((answer) => {
      if (answer.top === top) {
        if (!answer.revealed) {
          correct.play();
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
    addDoc(collection(db, "answers"), {
      value: "wrong",
      questionId: currentQuestionId,
    });

    wrong.volume = 1;
    wrong.play();
  };

  const handleOnRoundChange = (round: number) => {
    const docRef = doc(db, "game", "state");
    updateDoc(docRef, {
      round,
    });
  };

  return (
    <main className="h-screen flex justify-center items-center gap-6 flex-col">
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
        <h3 className="font-bold text-lg m-0">{currentQuestion?.question}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-[800px]">
        <div className="grid grid-cols-1 gap-4 border-4 border-gray-700 rounded-xl p-5">
          {currentQuestion?.answers.map((answer) => (
            <div
              className="bg-blue-400 h-12 rounded-lg grid place-content-center font-semibold text-white cursor-pointer relative"
              key={answer.top}
              onClick={() => handleOnReveal(answer.top)}
            >
              {!answer.revealed && (
                <div className="absolute w-full h-full  rounded-lg bg-black bg-opacity-50"></div>
              )}
              {answer.title}
            </div>
          ))}
          <div
            className="bg-red-500 h-12 rounded-lg grid place-content-center font-semibold text-white cursor-pointer relative hover:bg-red-600"
            key="wrong-answer"
            onClick={() => handleOnWrongAnswer()}
          >
            Wrong Answer
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 border-4 border-gray-700 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              className={` h-12 font-semibold text-white rounded-lg ${
                currentQuestion?.number === 1 ? "bg-blue-300" : "bg-blue-500"
              }`}
              onClick={() => handleOnPrevRound()}
              disabled={currentQuestion?.number === 1}
            >
              PREV QUESTION
            </button>

            <button
              className={` h-12 font-semibold text-white rounded-lg ${
                currentQuestion && currentQuestion?.number >= questions.length
                  ? "bg-blue-300"
                  : "bg-blue-500"
              }`}
              onClick={() => handleOnNextRound()}
              disabled={
                currentQuestion && currentQuestion?.number >= questions.length
              }
            >
              NEXT QUESTION
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
