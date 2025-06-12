import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { AllHints, UserActions, genID } from "../../stores/utils";
import ChatAvatar from "./ChatAvatar";
import "./ChatPage.css";
import { store } from "../../stores/Store";
import { TestcaseDropdown } from "./TestcaseDropdown";
import { postShowExplPool, saveButtons } from "../../stores/requests";
import Select from "react-select";
import BeatLoader from "react-spinners/BeatLoader";

const Intents = {
  // teachers'
  SubmitExpl: "submit-explanation",
  SubmitTestcase: "submit-testcase",
  SubmitCodeStatus: "judge-code-status",
  AskHelp: "ask-help",
  AskExpl: "ask-explanation",
  AskCodeStatus: "ask-code-status",
  AskHelpElse: "ask-help-else",
  Exit: "exit",
  SubmitCodeCorrect: "confirm-correct",
  SubmitCodeIncorrect: "confirm-incorrect",
  SubmitCodeIDK: "confirm-idk",
};
const DefaultMsgs = {
  AskHelp:
    "! Here is my code and I think I have some problem with it. Can you walk me through that?",
  AskExpl:
    "Ok, I see my code got this test case wrong. Could you explain what's wrong with my code?",
  AskHelpElse: "What else do I need to fix?",
  AskCodeStatus:
    "Thanks so much for your explanation! I've updated my code to fix this bug, is my code correct now?",
  SubmitCodeCorrect: "Yes, there's no more bug in your fixed code.",
  SubmitCodeIncorrect: "Nope, there're more bugs you need to fix.",
  SubmitCodeIDK: "I'm not really sure either.",
  Exit: "I see, thank you so much for your help today!",
};

// message data
export const NewChatPage = observer(
  ({ problem, testcaseIds, codeIdx, dialogHint, userAction }) => {
    const lastMessageRef = useRef(null);
    const avatarIdx = (codeIdx % 3) + 1;
    console.log(userAction);

    const generateMessage = (text, option, intent, isTeacher) => {
      return {
        id: genID(),
        text: text,
        option: option,
        intent: intent,
        isTeacher: isTeacher,
      };
    };

    const prevMessages = store.localstore.getLocal("messages", null) || [
      generateMessage(
        "Hi " + store.nickname + DefaultMsgs.AskHelp,
        null,
        Intents.AskHelp,
        false
      ),
    ];
    const defaultOptions = store.localstore.getLocal("explPool", null) || [
      { value: "default", label: "Enter your own explanation." },
    ];
    let defaultTC = null;
    const selectedTCId = store.localstore.getLocal("selectedTCId", -1);
    if (selectedTCId in store.testcaseDict) {
      defaultTC = store.testcaseDict[selectedTCId];
    }
    const [textContent, setTextContent] = useState("");
    const [sendIntent, setSendIntent] = useState(null);
    const [selectedTC, setSelectedTC] = useState(defaultTC);
    const [selectedExpl, setSelectedExpl] = useState(null);
    const [explOptions, setExplOptions] = useState(defaultOptions);
    const [isWait, setIsWait] = useState(null);

    const [isSendDisabled, setIsSendDisabled] = useState(false);
    // eslint-disable-next-line
    const [isTypingDisabled, setIsTypingDisabled] = useState(false);
    const [messages, setMessages] = useState(prevMessages);

    const setMessagesWrapper = (newMsg) => {
      setMessages((prevMsg) => {
        store.localstore.saveLocal("messages", [...prevMsg, newMsg]);

        return [...prevMsg, newMsg];
      });
    };

    // set the scrolling
    useEffect(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
      if (userAction === UserActions.ConfirmCode) {
        const newTeacherMsg = generateMessage(
          "Is the student correct?",
          <div>
            <button
              className="btn btn-warning final-button"
              onClick={yesButton}
            >
              Yes
            </button>

            <button className="btn btn-warning final-button" onClick={noButton}>
              No
            </button>

            <button
              className="btn btn-warning final-button"
              onClick={idkButton}
            >
              I don't know
            </button>
          </div>,
          Intents.AskCodeStatus,
          true
        );
        setMessagesWrapper(newTeacherMsg);
      }
    // eslint-disable-next-line
    }, [userAction]);

    // set the explanations
    const onLoadExplPool = async () => {
      if (!problem.isHasCode()) {
        return null;
      }
      const responses = await postShowExplPool(
        problem.getBasics(store.username)
      );
      if (responses !== null) {
        console.log("NewChatPage - Explanation", responses);
        setExplOptions(responses);
        store.localstore.saveLocal("explPool", responses);
      }
    };

    const sleepInChat = async () => {
      await new Promise((r) => setTimeout(r, 500));
      setIsWait(true);
      await new Promise((r) => setTimeout(r, 1000));
      setIsWait(false);
    };

    const cleanOnSent = () => {
      setTextContent("");
      setSendIntent(null);
      setIsSendDisabled(true);
      setIsTypingDisabled(true);
    };

    const exitButtons = async (teacherMsg, teacherIntent) => {
      saveButtons(problem.getBasics(store.username), teacherIntent);
      const newTeacherMsg = generateMessage(
        teacherMsg,
        null,
        teacherIntent,
        true
      );
      setMessagesWrapper(newTeacherMsg);
      cleanOnSent();
      await sleepInChat();
      const newStudentMsg = generateMessage(
        DefaultMsgs.Exit,
        null,
        Intents.Exit,
        false
      );
      setMessagesWrapper(newStudentMsg);
      await new Promise((r) => setTimeout(r, 2000));
      // reset
      store.localstore.saveLocal("messages", null);
      store.localstore.saveLocal("explPool", null);
      store.localstore.saveLocal("selectedTCId", null);
      store.setNextStage();
    };

    const yesButton = async () => {
      exitButtons(DefaultMsgs.SubmitCodeCorrect, Intents.SubmitCodeCorrect);
    };

    const noButton = async () => {
      exitButtons(DefaultMsgs.SubmitCodeIncorrect, Intents.SubmitCodeIncorrect);
    };

    const idkButton = async () => {
      exitButtons(DefaultMsgs.SubmitCodeIDK, Intents.SubmitCodeIDK);
    };

    const onSend = async () => {
      console.log("onSend", textContent, sendIntent);
      if (sendIntent === Intents.SubmitTestcase && textContent) {
        store.setHint("", true);
        // every time we send a new test
        store.localstore.saveLocal("selectedTCId", selectedTC.id);
        store.localstore.saveLocal("explPool", null);
        const newTeacherMsg = generateMessage(
          textContent,
          null,
          sendIntent,
          true
        );
        setMessagesWrapper(newTeacherMsg);
        cleanOnSent();

        await sleepInChat();
        const newStudentMsg = generateMessage(
          DefaultMsgs.AskExpl,
          null,
          Intents.AskExpl,
          false
        );
        await onLoadExplPool();
        store.setUserAction(UserActions.ExplainTC);
        setMessagesWrapper(newStudentMsg);
        // get the explanations

        // send explanation corrections
      } else if (sendIntent === Intents.SubmitExpl && textContent) {
        const codeid = problem.code.buggy_code_name;
        console.log(
          "=>>>>problem.code",
          problem.code,
          "problem.code.buggy_code_name",
          problem.code.buggy_code_name
        );
        const newTeacherMsg = generateMessage(
          textContent,
          null,
          sendIntent,
          true
        );
        setMessagesWrapper(newTeacherMsg);
        cleanOnSent();
        if (selectedExpl === codeid) {
          setIsWait(true);
          const hint = await store.submitExpl(selectedExpl, selectedTC);
          //setIsWait(false);
          await sleepInChat();
          // correct code
          if (hint) {
            const newStudentMsg = generateMessage(
              hint,
              null,
              Intents.AskCodeStatus,
              false
            );
            store.setUserAction(UserActions.EvaluateSuite);

            store.setHint(
              AllHints.RunTestSuite.text,
              AllHints.RunTestSuite.isDialogHint
            );
            setMessagesWrapper(newStudentMsg);
          } else {
            store.setHint(
              AllHints.DoesNotUnderstandExpl.text,
              AllHints.DoesNotUnderstandExpl.isDialogHint
            );
          }
        } else {
          // selectedExpl !== codeid
          setIsWait(true);
          const res = await store.submitDistractor(selectedExpl, selectedTC);
          if (res) {
            const diffTest = res.diffTest;
            const confusionMsg = `<div>But if that's the case, shouldn't <code>${problem.problem_name}(${diffTest.test_input})</code> give me <code>${diffTest.distractor_output}</code>? Currently my code would output <code>${diffTest.actual_output}</code>. </div>`;
            console.log(
              "==>>>submitDistractor",
              selectedExpl,
              codeid,
              diffTest
            );
            console.log("==>>>confusionMsg", confusionMsg);
            await sleepInChat();
            const newStudentMsg = generateMessage(
              confusionMsg,
              null,
              Intents.AskHelpElse,
              false
            );
            setMessagesWrapper(newStudentMsg);
            store.setHint(res.hint.text, res.hint.isDialogHint);
          } else {
            store.setHint(
              AllHints.DoesNotUnderstandExpl.text,
              AllHints.DoesNotUnderstandExpl.text
            );
          }
          setIsWait(false);
        }
      }
    };

    const testcaseDropdown = userAction === UserActions.SelectTC && (
      <TestcaseDropdown
        testcaseIds={testcaseIds}
        onSelectTestcase={(text, testcase) => {
          setTextContent(text);
          setSelectedTC(testcase);
          setSendIntent(Intents.SubmitTestcase);
          setIsSendDisabled(testcase === null);
          setIsTypingDisabled(testcase === null);
          store.setHint("", true);
          store.setHint("", false);
        }}
      />
    );

    const explanationDropdown = userAction === UserActions.ExplainTC && (
      <Select
        key={explOptions.map((o) => o.value).join("-")} // or just use o.value directly
        options={explOptions.map((o) => {
          return {
            option: o,
            value: o.value,
            label: o.label.startsWith("<") ? (
              <div dangerouslySetInnerHTML={{ __html: o.label }} />
            ) : (
              o.label
            ),
          };
        })}
        onChange={(selectedOption) => {
          const selectExpl = selectedOption.value;
          if (selectExpl) {
            setSendIntent(Intents.SubmitExpl);
            setTextContent(selectedOption.label);
            setSelectedExpl(selectExpl);
          }
          setIsSendDisabled(selectExpl === null);
          setIsTypingDisabled(selectExpl === null);
          store.setHint("", true);
          store.setHint("", false);
        }}
      />
    );

    const chatBody = (
      <div className="chatBody active">
        <div className="chatSession">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className="container"
                id={message.isTeacher ? "messageContainer" : "replyContainer"}
              >
                {!message.isTeacher && (
                  <ChatAvatar role={`student${avatarIdx}`} />
                )}
                <div
                  className={`${
                    message.isTeacher ? "message" : "reply"
                  } animateChat accentColor chatdiv`}
                >
                  <p>
                    {message.text.startsWith("<") ? (
                      <div dangerouslySetInnerHTML={{ __html: message.text }} />
                    ) : (
                      message.text
                    )}
                  </p>
                  {message.option}
                </div>
                {message.isTeacher && <ChatAvatar role={"teacher"} />}
              </div>
            </div>
          ))}
          <div ref={lastMessageRef}></div>
          <div>
            <BeatLoader
              style={{ display: isWait ? "" : "none" }}
              loading={true}
              aria-label="Loading"
            />
          </div>
        </div>
      </div>
    );

    const chatInputBox = (
      <div className="chatForm active">
        <div className="typingArea">
          <div
            name="chatInput"
            id="chatTextBox"
            className="textArea"
            //disabled={isTypingDisabled}
          >
            {textContent.startsWith("<") ? (
              <div dangerouslySetInnerHTML={{ __html: textContent }} />
            ) : (
              textContent
            )}
          </div>
          <button
            className="button-font-class sendButton"
            id="sendButton"
            disabled={isSendDisabled}
            onClick={onSend}
          >
            <span className="text-white">Send</span>
          </button>
        </div>
      </div>
    );

    return (
      <div className="chatbot card" id="aibot">
        <div className="card-body">
          <div className="chatBot active;">
            <div className="chatBotHeading">
              <span style={{ whiteSpace: "nowrap", overflow: "unset" }}>
                Office Hour!
              </span>
            </div>
            {chatBody}
          </div>

          <div className="tc-pool">
            {testcaseDropdown}
            {explanationDropdown}
          </div>
          <div className="explanation-pool dialoghint-msg">
            {dialogHint && dialogHint.startsWith("<") ? (
              <div dangerouslySetInnerHTML={{ __html: dialogHint }} />
            ) : (
              dialogHint
            )}
          </div>

          <div className="chatBot active;">{chatInputBox}</div>
        </div>
      </div>
    );
  }
);
