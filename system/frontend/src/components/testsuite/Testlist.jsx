import { Testitem } from "./Testitem";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";
import { UserActions } from "../../stores/utils";

export const Testlist = observer(({ testgroup, index, userAction }) => {

  // if testgroup is undefined (because of racing in delete), return empty div
  if (testgroup === undefined) { return <div></div>; }

  const displayMode = testgroup.isDefaultGroup() ? "none" : "";
  console.log("Testlist rendering: deep copy Test Suite", JSON.parse(JSON.stringify(testgroup)));

  return (
    <Draggable
      draggableId={testgroup.id}
      key={"TG-drag" + testgroup.id}
      index={index}
    >
      {(provided) => (
        <div
          className="testgroup"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div className="testgroup-firstline">
            <div className="testgroup-header" {...provided.dragHandleProps}>
              <input
                type="text"
                // style={{ display: displayMode }}
                value={testgroup.title}
                disabled={testgroup.isDefaultGroup()}
                onChange={(e) => {
                  if (e.target.value === "") {
                    store.setHint("Test group title cannot be empty!", false);
                  } else {
                    testgroup.setTitle(e.target.value, store.problem, false);
                  }
                }}
                onKeyUp={(e) => {if (e.key === "Enter") { e.target.blur(); }}}
                onBlur={(e) => {testgroup.setTitle(e.target.value, store.problem, true);}}
              />
            </div>
            <div className="deletegroup" style={{ display: displayMode }}>
              <button
                className="remove-test-btn"
                disabled={userAction === UserActions.SelectTC}
                onClick={() => store.deleteTestgroup(testgroup.id)}
              >
                Delete Group
              </button>
            </div>
          </div>
          <div className="testgroup-body">
            <Droppable
              droppableId={testgroup.id}
              key={"TG-drop" + testgroup.id}
              type="testcase"
            >
              {(provided, snapshot) => (
                <div
                  className={
                    snapshot.isDraggingOver
                      ? "testlist-dragged"
                      : "testlist-no-drag"
                  }
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {testgroup.testlist.map((testId, index) => {
                    const testcase = store.testcaseDict[testId];
                    return (
                      <Testitem
                        key={testId}
                        index={index} // index is the place of this testcase in a group
                        testcase={testcase}
                        userAction={userAction}
                      />
                    );
                  })}
                  <span style={{ color: "white", fontSize: "5px" }}>hi</span>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
});
