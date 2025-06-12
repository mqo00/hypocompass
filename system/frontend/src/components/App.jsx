import { observer } from "mobx-react-lite";
import { Login } from "./login/Login";
import { store } from "../stores/Store";
import { Loginheader } from "./login/Loginheader";
import { useEffect } from "react";
import { Guideline } from "./introduction/Guideline";
import { ProblemDesc } from "./introduction/ProblemDesc";
import { FrontStates } from "../stores/utils";
import { Testsuite } from "./testsuite/Testsuite";
import { QueuePage } from "./chatbot/QueuePage";
import { CodeShow } from "./codevis/CodeShow";
import { CodeDiff } from "./codevis/CodeDiff";
import { NewChatPage } from "./chatbot/NewChatPage";
const App = observer(() => {
  useEffect(() => {
    store.setup();
  }, []);

  const loginPage = !store.isLogin() && <Login username={store.username} />;
  const loginHeaderPage = store.isLogin() && (
    <Loginheader username={store.username} />
  );
  const guidelinePage = store.isLogin() && (
    <Guideline
      nickname={store.nickname}
      currStage={store.currStage}
      problem={store.problem}
      codeIdx={store.codeIdx}
    />
  );
  const problemDescPage = (
    <ProblemDesc problem={store.problem} problemIdx={store.problemIdx} />
  );
  const testSuitePage = (
    <Testsuite
      testcaseIds={store.testcaseIds}
      testgroupIds={store.testgroupIds}
      hint={store.hint}
      userAction={store.userAction}
      problem={store.problem}
    />
  );

  const studentQueuePage = store.currStage === FrontStates.QueuePage && (
    <QueuePage codeIdx={store.codeIdx} problem={store.problem} />
  );
  if (store.isHasProblem() && store.problem.isHasCode()) {
    console.log("App - code", store.problem.code.code);
  }
  if (store.isHasProblem() && store.problem.isHasCode()) {
    console.log("App - code", store.problem.code.old_code);
  }
  const codeShowPage = store.currStage === FrontStates.ChatPage &&
    store.isHasProblem() &&
    store.problem.isHasCode() && (
      <CodeShow key={store.problem.code.code} code={store.problem.code.code} />
    );
  const codeDiffPage = store.currStage === FrontStates.ChatPage &&
    store.isHasProblem() &&
    store.problem.isHasDiffCode() && (
      <CodeDiff
        key={store.problem.code.old_code}
        new_code={store.problem.code.code}
        old_code={store.problem.code.old_code}
      />
    );

  const chatPage = store.currStage === FrontStates.ChatPage && (
    <NewChatPage
      userAction={store.userAction}
      testcaseIds={store.testcaseIds}
      codeIdx={store.codeIdx}
      dialogHint={store.dialogHint}
      problem={store.problem}
    />
  );

  const debugBtn = store.localstore.isDebug && (
    <button
      onClick={() => {
        store.localstore.resetLocal();
        store.setup();
      }}
    >
      Clear storage
    </button>
  );
  /** Make the main page */
  const isSingleColumn = store.currStage === FrontStates.IntroPage;
  const mainPage = (
    <div className={`main-container ${!store.isLogin() ? "hidden" : ""}`}>
      <div className="column code">
        <div className={isSingleColumn ? "hidden" : ""}>
          {debugBtn}
          {problemDescPage}
        </div>
        {guidelinePage}
        <div className={isSingleColumn ? "hidden" : ""}>
          {codeShowPage}
          {codeDiffPage}
        </div>
      </div>
      <div className={isSingleColumn ? "hidden" : "column test"}>
        {testSuitePage}
      </div>
      <div className={isSingleColumn ? "hidden" : "column chat"}>
        {loginHeaderPage}
        {studentQueuePage}
        {chatPage}
      </div>
    </div>
  );
  return (
    <>
      {loginPage}
      {mainPage}
    </>
  );
});

export default App;
