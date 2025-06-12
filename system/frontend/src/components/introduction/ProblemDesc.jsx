import "reactjs-popup/dist/index.css";
import { observer } from "mobx-react-lite";
import { store } from "../../stores/Store";

export const ProblemDesc = observer(({ problem, problemIdx }) => {
  if (!problem || !problem.isHasProblem()) {
    return null;
  }
  return (
    <div className="instruction">
      {/* Test Suite Development Module */}
      <h4 style={{ display: "inline", marginInline: "10px" }}>
        Problem {problemIdx + 1} / {store.numProblems}: {problem.problem_name}
      </h4>
      <div className="description">{problem.description}</div>
    </div>
  );
});
