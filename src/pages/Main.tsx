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

export const Main = () => {
  const { db } = useContext(firebaseContext);
  const { currentQuestion } = useContext(SurverySaysContext);

  const [wrong, setWrong] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "answers"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // console.log(snapshot.);
        if (change.type === "added") {
          const answer = change.doc.data();
          if (answer.value === "wrong") {
            setWrong(true);

            setTimeout(() => {
              setWrong(false);
            }, 2000);
          }
          deleteDoc(change.doc.ref);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <main className="h-screen w-screen flex justify-center items-center flex-col gap-8 relative">
      {/* <h1 className="font-bold text-4xl text-violet-400">MMI Family Feud</h1> */}
      {wrong && (
        <div className="absolute h-screen w-screen bg-black bg-opacity-75 grid place-content-center">
          <XCircleIcon className="w-44 h-44 text-red-600 rounded-full border-8 border-red-600" />
        </div>
      )}

      <div className="bg-gray-700 p-6 pb-8 w-[800px] rounded-3xl text-center">
        <h5 className="text-amber-400 font-bold text-2xl mb-4">
          QUESTION {currentQuestion?.number}
        </h5>
        <h4 className="text-4xl font-bold text-white leading-snug">
          {currentQuestion?.question.toUpperCase()}
        </h4>
      </div>

      <div className="bg-gradient-to-br from-gray-600 to-gray-900 p-6 rounded-3xl">
        <div className="rounded-2xl p-4 bg-gray-800 border-8 border-amber-400">
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
    </main>
  );
};
