import React from "react";
import "./ChatPage.css";
import "bootstrap/dist/css/bootstrap.css";
import ChatAvatar from "./ChatAvatar";
import { FrontStates } from "../../stores/utils";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";

export const QueuePage = observer(({ problem, codeIdx }) => {

  // eslint-disable-next-line no-unused-vars
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  let allStudents = ["Bob", "Chelsea", "Dave", "Linda", "Mike", "Rachel"];
  // shuffle(allStudents);
  // const [msg, setMsg] = useState("")

  const studentPage = (
    <>
      {allStudents.map((student, idx) => {
        if (idx >= problem.numCodes) {
          return null;
        }
        const avatarIdx = (idx % 3) + 1;
        var msg = "Waiting...";
        // const msg = idx === codeIdx + 1 ? "Start helping" : "Waiting..."; // next to help
        if (idx === codeIdx + 1) {
          msg = "Start helping";
        } else if (idx < codeIdx + 1) {
          msg = "Finished!";
        }

        return (
          <button
            type="button"
            key={idx}
            // disabled={idx > codeIdx + 1}
            disabled={idx !== codeIdx + 1}
            className="unsolved-queue-btn btn btn-secondary text-left"
            onClick={() => {
              if (store.currStage === FrontStates.QueuePage) {
                store.setNextStage();
              }
            }}
          >
            <ChatAvatar role={`student${avatarIdx}`} />
            <span id="unsolved-head-text">
              {student}: {msg}
            </span>
          </button>
        );
      })}
    </>
  );
  return (
    <div className="card" id="botfront">
      <div className="card-body">
        <div>
          <div className="chatBotHeading">
            <span className="botHeading">Office Hour Queue</span>
          </div>

          <div className="front-text text-left">
            There are several students waiting for your help, please click to
            start chatting with them.
          </div>
          <div>{studentPage}</div>
        </div>
      </div>
    </div>
  );
});
