import { Draggable } from "react-beautiful-dnd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { observer } from "mobx-react-lite";
import { UserActions } from "../../stores/utils";
import { store } from "../../stores/Store";

export const Testitem = observer(({ index, testcase, userAction }) => {
  const unTouched = !testcase.has_been_evaluated;
  const isPassed = testcase.has_been_evaluated && testcase.get_pf() === true;
  const actual_behavior = unTouched
    ? "unevaluated"
    : testcase.get_actual_behavior();

  return (
    <Draggable
      draggableId={testcase.id}
      key={testcase.id}
      index={index}
      isDragDisabled={userAction === UserActions.SelectTC}
    >
      {
        (provided, snapshot) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={
              snapshot.isDragging
                ? "testcase testcase-dragged"
                : "testcase testcase-no-drag"
            }
          >
            <div className="test-item-box">
              <SyntaxHighlighter
                language="python"
                style={coy}
                wrapLongLines
                className={`testcase-claim ${
                  isPassed ? "claim-left-pass" : "claim-left-fail"
                }`}
              >
                {testcase.testString}
              </SyntaxHighlighter>
              <span
                style={{ visibility: unTouched ? "hidden" : "visible" }}
                className={isPassed ? "pf pf-p" : "pf pf-f"}
              >
                {isPassed ? "✓" : "✕"}
              </span>
              <div className="behavior-box">
                <div style={{ visibility: unTouched ? "hidden" : "visible" }}>
                  <code>{actual_behavior}</code>
                </div>
                <button
                  className="remove-test-btn"
                  style={{
                    display: userAction === UserActions.SelectTC ? "none" : "",
                  }}
                  onClick={() => {
                    console.log("deleting test case", testcase.id);
                    store.deleteTestcase(testcase.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) // draggrable
      }
    </Draggable>
  );
});
