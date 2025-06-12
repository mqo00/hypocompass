export const FrontStates = {
  LoginPage: "LoginPage",
  IntroPage: "IntroPage",
  ProblemPage: "ProblemPage",
  QueuePage: "QueuePage",
  ChatPage: "ChatPage",
  CongratsPage: "CongratsPage",
};
export const MAX_NUM_STUDENTS = 3;
export const STUDY_LENGTH = 30;
export const MIN_NUM_TESTCASES = 3;

export const UserActions = {
  SelectTC: "SelectTC",
  WriteTC: "WriteTC",
  ExplainTC: "ExplainTC",
  EvaluateSuite: "EvaluateSuite",
  ConfirmCode: "ConfirmCode",
};

export const AllHints = {
  WriteMoreCase: {
    text: `Please write at least ${MIN_NUM_TESTCASES} tests before helping a student.`,
    isDialogHint: false,
  },
  AllPassed: {
    text: "All of your test cases passed.",
    isDialogHint: true,
  },
  ConsiderTestCase: {
    text: " Consider this input: ",
    isDialogHint: true,
  },
  SelectFailedCase: {
    text: "Test suite evaluated! Select a test case to start explain.",
    isDialogHint: true,
  },
  RunTestSuite: {
    text: "Click 'Evaluate Test Suite' button to test the student's code!",
    isDialogHint: true,
  },
  DoesNotUnderstandExpl: {
    text: "I don't understand your explanation, can you elaborate more?",
    isDialogHint: true,
  },
  SelectAnotherExpl: {
    text: "Try to select another explanation",
    isDialogHint: true,
  },
  DuplicateTestcase: {
    text: "Test case already exist, please add an unique test case.",
    isDialogHint: false,
  },
  InvalidTestcase: {
    text: "Your input or output is not valid, please try again.",
    isDialogHint: false,
  },
  GeneralWrongTestcase: {
    text: "Something went wrong!",
    isDialogHint: false,
  },
};

export function isSufficientTestcases(testcases) {
  return testcases.length >= MIN_NUM_TESTCASES;
}

export function genID() {
  return Math.random().toString(36).substr(2, 9);
}
