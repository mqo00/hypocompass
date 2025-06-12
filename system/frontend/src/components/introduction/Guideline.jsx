import "reactjs-popup/dist/index.css";
import "./Introduction.css";
import {
  FrontStates,
  MAX_NUM_STUDENTS,
  STUDY_LENGTH,
} from "../../stores/utils";
import { observer } from "mobx-react-lite";
import { store } from "../../stores/Store";

export const Guideline = observer(
  ({ nickname, currStage, codeIdx, problem }) => {
    console.log("Guideline.jsx", nickname, currStage);

    const IntroPage = (
      <>
        <div>
          Welcome, {nickname}! In the next {STUDY_LENGTH} minutes, you will play
          the role of a Teaching Assistant, and help three students with their
          programming assignments. Specifically, You will see descriptions for{" "}
          <span className="task-highlight">{store.numProblems}</span>{" "}
          programming exercises. For each exercise, you will need to:
        </div>
        <ol>
          <li>
            <span className="task-highlight">develop a test suite</span> so that
            no student's buggy solution passes your auto-grader. The test suite
            should be <span className="task-highlight">comprehensive</span>{" "}
            (i.e., cover different categories of bugs), and{" "}
            <span className="task-highlight">effective</span> (i.e., do not have
            too much duplicative test cases).
          </li>
          <li>
            help up to {MAX_NUM_STUDENTS} students{" "}
            <span className="task-highlight">
              debug and fix their buggy solutions
            </span>
            . You will need to use your test cases to{" "}
            <span className="task-highlight">
              explain how their code was incorrect.
            </span>
          </li>
        </ol>
        <div>
          Note that you should time yourself so you have time to help all the
          students. When you click on the "Start" button below, you will start
          seeing the first programming exercise. Please try your best to be a
          responsive TA!
        </div>
        <button
          className="btn btn-secondary btn-block submission-button"
          disabled={false}
          onClick={async () => {
            if (store.currStage === FrontStates.IntroPage) {
              await store.setNextStage();
            }
          }}
        >
          Got it! Get Started.
        </button>
      </>
    );

    const ProblemPage = (
      <>
        Please read the problem description carefully, and write a comprehensive
        test suite for it. Do so by writing simple and unique test cases, and
        sorting them into different test groups{" "}
        <span className="task-highlight">
          targetting at different ways a code may fail
        </span>
        . You can also create your own test groups.
      </>
    );

    const QueuePage = problem && (
      <>
        Okay! Now students have used your test suite to validate their own
        implemented solutions, and <b>{problem.numCodes}</b> of them come to
        your office hour to get your help.{" "}
        <span className="task-highlight">
          Please click on the student name{" "}
        </span>
        to start helping them debug their code.
      </>
    );

    const QueuePageFinished = (
      <>
        You have finished helping students with this problem. Let's move to the
        next problem!{" "}
        <button
          className="btn btn-secondary btn-block submission-button"
          disabled={false}
          onClick={async () => {
            await store.setNextStage();
          }}
        >
          Next Question
        </button>
      </>
    );

    const ChatPage = (
      <>
        Now you are chatting with a student. Please explain to them why their
        code is wrong by selecting the right explanation from the list. If you
        are right, the student will fix their code accordingly! Otherwise, they
        may get frustrated and leave.
      </>
    );

    const CongratsPage = (
      <>
        <div>
          <span className="task-highlight">Congratulations</span> &#127881;,{" "}
          {nickname}! You have successfully played the role of a Teaching
          Assistant, and helped three students with their programming
          assignments. Thanks for your participation!
        </div>
        <br></br>
        <button
          className="btn btn-secondary btn-block submission-button"
          disabled={false}
          onClick={async () => {
            if (store.currStage === FrontStates.CongratsPage) {
              await store.setNextStage();
            }
          }}
        >
          Finish the practice!
        </button>
      </>
    );

    const guidelineView = (currStage) => {
      let currPage = null;
      switch (currStage) {
        case FrontStates.IntroPage:
          currPage = IntroPage;
          break;
        case FrontStates.ProblemPage:
          currPage = ProblemPage;
          break;
        case FrontStates.QueuePage:
          if (codeIdx >= problem.numCodes - 1) {
            currPage = QueuePageFinished;
          } else {
            currPage = QueuePage;
          }
          break;
        case FrontStates.ChatPage:
          currPage = ChatPage;
          break;
        case FrontStates.CongratsPage:
          currPage = CongratsPage;
          break;
        default:
          return null;
      }
      return (
        <div className="guideline" key={currPage}>
          {currPage}
        </div>
      );
    };
    return guidelineView(currStage);
  }
);
