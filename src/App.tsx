import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@tremor/react/dist/esm/tremor.css";
import { Controls } from "./pages/Controls";
import { Main } from "./pages/Main";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseContext } from "./context/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export interface QuestionAnswer {
  top: number;
  title: string;
  score: number;
  revealed: boolean;
}

export interface Question {
  number: number;
  question: string;
  answers: QuestionAnswer[];
  active: boolean;
  round: 1;
}

export interface SurverySaysContextProps {
  questions: Question[];
  currentQuestion?: Question;
  currentQuestionId?: string;
  currentRound?: number;
}

export interface GameState {
  state: 0 | 1 | 2;
  round: 1 | 2 | 3;
}

export const SurverySaysContext = createContext({} as SurverySaysContextProps);

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "/controls",
      element: <Controls />,
    },
  ]);

  const { db } = useContext(firebaseContext);
  const [currentRound, setRound] = useState<number | undefined>(undefined);
  const [currentQuestionId, setQuestionId] = useState<string>();
  const [currentQuestion, setQuestion] = useState<Question>();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "game", "state"), (snapshot) => {
      const { round } = snapshot.data() as GameState;
      setRound(round);

      // setQuestion(undefined);
      // setQuestionId(undefined);

      // const q = query(collection(db, "questions"), where("round", "==", round));

      // getDocs(q).then((response) => {
      //   const questionSet = new Set<Question>();
      //   response.forEach((doc) => {
      //     const question = doc.data() as Question;
      //     // console.log(question);
      //     questionSet.add(question);
      //     if (question.active) {
      //       setQuestion(question);
      //       setQuestionId(doc.id);
      //     }
      //   });
      //   setQuestions([...questionSet]);
      // });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentRound) return;

    setQuestion(undefined);
    setQuestionId(undefined);

    console.log(currentRound);

    const questionQuery = query(
      collection(db, "questions"),
      where("round", "==", currentRound)
    );

    const unsub = onSnapshot(questionQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const question = change.doc.data() as Question;

        if (change.type === "added" || change.type === "modified") {
          if (question.active && question.round === currentRound) {
            console.log("set", question);
            setQuestion(question);
            setQuestionId(change.doc.id);
          }
        }
      });

      const questionSet = new Set<Question>();

      snapshot.forEach((result) => {
        const question = result.data() as Question;
        questionSet.add(question);
      });

      console.log(questionSet);

      setQuestions([...questionSet]);
    });

    return () => {
      unsub();
    };
  }, [currentRound]);

  // useEffect(() => {
  //   if (db) {
  //     const q = query(
  //       collection(db, "questions"),
  //       where("round", "==", currentRound)
  //     );

  //     getDocs(q).then((response) => {
  //       const questionSet = new Set<Question>();
  //       response.forEach((doc) => {
  //         const question = doc.data() as Question;
  //         // console.log(question);
  //         questionSet.add(question);
  //         if (question.active) {
  //           setQuestion(question);
  //           setQuestionId(doc.id);
  //         } else {
  //           setQuestion(undefined);
  //           setQuestionId(undefined);
  //         }
  //       });
  //       console.log(questionSet);
  //       setQuestions([...questionSet]);
  //     });
  //   }
  // }, [currentRound]);

  return (
    <div className="App">
      <SurverySaysContext.Provider
        value={{
          questions,
          currentQuestion,
          currentQuestionId,
          currentRound,
        }}
      >
        <RouterProvider router={router} />
      </SurverySaysContext.Provider>
    </div>
  );
}

export default App;
