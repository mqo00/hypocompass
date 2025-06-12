import { Addtest } from "./Addtest";
import { Testlist } from "./Testlist";
import Popup from "reactjs-popup";
import { observer } from "mobx-react-lite";

import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "./Testsuite.css";
import {
  AllHints,
  FrontStates,
  MIN_NUM_TESTCASES,
  UserActions,
  isSufficientTestcases,
} from "../../stores/utils";
import { useState } from "react";
import { Addtestgroup } from "./Addtestgroup";
import { store } from "../../stores/Store";

export const Testsuite = observer(
  ({ testcaseIds, testgroupIds, hint, userAction, problem }) => {
    const [isSubmitSuite, setIsSubmitSuite] = useState(false);
    const onDragEnd = (result) => {
      console.log(result);

      const { destination, source, draggableId, type } = result;
      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      if (type === "testgroup") {
        store.moveTestgroup(source, destination, draggableId);
        return;
      }
      store.moveTestcase(source, destination, draggableId);
    };
    const onSubmitTestsuite = async () => {
      if (!isSufficientTestcases(testcaseIds)) {
        store.setHint(
          AllHints.WriteMoreCase.text,
          AllHints.WriteMoreCase.isDialogHint
        );
        store.setUserAction(UserActions.WriteTC);
        return;
      }
      store.setHint("", false);
      if (problem.isHasCode()) {
        store.evaluateTestSuite();
        if (store.userAction === UserActions.EvaluateSuite) {
          store.setUserAction(UserActions.ConfirmCode);
        }
      } else {
        if (store.currStage === FrontStates.ProblemPage) {
          await store.setNextStage();
        }
      }
    };

    if (!problem || !problem.isHasProblem()) {
      return null;
    }
    if (testcaseIds === null || !testgroupIds === null) {
      return null;
    }

    console.log("Testsuite", [...testgroupIds]);
    console.log("Deep Copy Test Suite", JSON.parse(JSON.stringify(store.testgroupDict)));
    
    return (
      <div className="testsuite" key={testgroupIds.join("-")}>
        <h4>Test Suite Development</h4>
        <Addtest userAction={userAction} />
        <div className="hint-msg">{hint}</div>
        <Addtestgroup userAction={userAction} />

        {/* Button to submit or evaluate the Testsuite */}
        <button
          className="btn btn-secondary btn-block submission-button"
          // disabled={!isSufficientTestcases(testcaseIds)}
          onMouseOver={() => {
            if (!isSufficientTestcases(testcaseIds)) {
              setIsSubmitSuite(true);
            } else {
              setIsSubmitSuite(false);
            }
          }}
          onMouseOut={() => {
            setIsSubmitSuite(false);
          }}
          onClick={onSubmitTestsuite}
        >
          {problem.isHasCode()
            ? "Evaluate Test Suite"
            : "Submit Test Suite & Start Helping Students"}
        </button>
        <Popup
          open={isSubmitSuite}
          trigger={<span></span>}
          position="right center"
        >
          To ensure comprehensiveness, please add at least {MIN_NUM_TESTCASES}{" "}
          test cases.
        </Popup>

        <div className="test-item-box testcase-title">
          <div className="claim-left-space">
            <h6>Your Test Cases</h6>
          </div>
          <h6 className="pf">Passed?</h6>
          <h6 className="behavior-box">Actual Output</h6>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="all-testgroups"
            key="all-TG"
            direction="vertical"
            type="testgroup"
          >
            {(provided) => (
              <div
                className="all-testgroups"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {testgroupIds.map((groupidx, index) => {
                  const testgroup = store.testgroupDict[groupidx];
                  return (
                    <Testlist
                      testgroup={testgroup}
                      index={index}
                      key={groupidx}
                      userAction={userAction}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
);
