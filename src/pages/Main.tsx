import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Question, SurverySaysContext } from "../App";
import { firebaseContext } from "../context/firebase";
import { XCircleIcon } from "@heroicons/react/24/solid";

import Logo from "../assets/logo.png";

import correctSoundFX from "../assets/correct.mp3";
import wrongSoundFX from "../assets/wrong.mp3";
// import backgroundSoundFX from "../assets/background.mp3";

export const Main = () => {
  let correctFX = new Audio(correctSoundFX);
  let wrongFX = new Audio(wrongSoundFX);
  // let backgroundFX = new Audio(backgroundSoundFX);

  const { db } = useContext(firebaseContext);
  const { currentQuestion, currentState, currentRound } =
    useContext(SurverySaysContext);

  const [wrong, setWrong] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "answers"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const answer = change.doc.data();
          if (answer.value === "correct") {
            correctFX.play();
          }

          if (answer.value === "wrong") {
            wrongFX.play();

            setTimeout(() => {
              setWrong(true);
            }, 500);

            setTimeout(() => {
              setWrong(false);
            }, 2500);
          }
          deleteDoc(change.doc.ref);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (currentState === 2) {
    return (
      <main className="h-screen w-screen flex justify-center items-center flex-col gap-8 relative bg-cover bg-[url('https://cdn1.edgedatg.com/aws/v2/abc/CelebrityFamilyFeud/showimages/a4b945dcb979e18e8ab71496668e2294/1440x812-Q80_a4b945dcb979e18e8ab71496668e2294.jpg')]">
        <div className="text-center flex flex-col justify-center items-center gap-6">
          <h3 className="text-white font-bold text-[1.6rem]">WELCOME TO</h3>
          <img className="h-auto w-96" src={Logo} alt="" />
          <div>
            <h6 className="text-blue-100 font-semibold text-lg mt-8 mb-0">
              PRESENTED TO YOU BY THE
            </h6>
            <h1 className="text-white text-[3rem] font-bold">IT TEAM</h1>
          </div>
        </div>
      </main>
    );
  }

  if (currentState === 0) {
    return (
      <main className="h-screen w-screen flex justify-center items-center flex-col gap-8 relative bg-cover bg-[url('https://cdn1.edgedatg.com/aws/v2/abc/CelebrityFamilyFeud/showimages/a4b945dcb979e18e8ab71496668e2294/1440x812-Q80_a4b945dcb979e18e8ab71496668e2294.jpg')]">
        <div className="text-center flex flex-col justify-center items-center gap-6">
          <img className="h-auto w-56" src={Logo} alt="" />
          <h1 className="text-white font-bold text-[5rem]">
            ROUND {currentRound}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen flex justify-center items-center flex-col gap-8 relative bg-[url('https://cdn1.edgedatg.com/aws/v2/abc/CelebrityFamilyFeud/showimages/a4b945dcb979e18e8ab71496668e2294/1440x812-Q80_a4b945dcb979e18e8ab71496668e2294.jpg')]">
      {/* <h1 className="font-bold text-4xl text-violet-400">MMI Family Feud</h1> */}
      {wrong && (
        <div className="absolute h-screen w-screen bg-black bg-opacity-75 grid place-content-center">
          <XCircleIcon className="w-44 h-44 text-red-600 rounded-full border-8 border-red-600" />
        </div>
      )}

      {currentQuestion && (
        <>
          <img className="h-auto w-32" src={Logo} alt="" />

          <div className="bg-gradient-to-br from-blue-900 to-gray-900 bg-opacity-100 p-6 pb-8 w-[800px] rounded-3xl text-center">
            <div className="mb-4">
              <div className="text-white font-bold">ROUND {currentRound}</div>

              <div className="text-amber-400 font-bold text-2xl">
                QUESTION {currentQuestion?.number}
              </div>
            </div>
            <h4 className="text-4xl font-bold text-white leading-snug">
              {currentQuestion?.question.toUpperCase()}
            </h4>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-6 rounded-3xl">
            <div className="rounded-2xl p-4 bg-blue-800 border-8 border-amber-400">
              <div className="flex flex-col gap-4 w-[520px]">
                {currentQuestion?.answers.map((answer, index) => (
                  <div
                    key={answer.top}
                    className="h-20 p-6 bg-gradient-to-t from-blue-800 via-blue-500  to-blue-800 rounded-2xl border-4 border-white flex gap-2 items-center justify-between"
                  >
                    {answer.revealed ? (
                      <>
                        <p className="font-bold text-white text-3xl ">
                          {answer.title.toUpperCase()}
                        </p>
                        <p className="font-bold text-white text-3xl">
                          {answer.score}
                        </p>
                      </>
                    ) : (
                      <div className="w-full flex justify-center">
                        <div className="text-blue-600 font-black text-lg bg-white aspect-square w-10 rounded-full grid place-content-center">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};
