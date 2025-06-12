import { AllHints, FrontStates, UserActions } from "./utils";
import { LocalStore } from "./Localstore";
import { Testcase } from "./Testcase";
import { DEFAULT_TESTGROUP_ID, Testgroup } from "./Testgroup";
import { Problem } from "./Problem";
import {
  getCode,
  getLogin,
  getProblem,
  getTGInit,
  postSubmitFix,
  postSubmitDistractor,
  postUpdateTG,
  getNumProblem,
} from "./requests";
import { makeObservable, observable } from "mobx"; // action

export class Store {
  constructor() {
    this.localstore = new LocalStore("localstore", [], "test", true);
    this.numProblems = null;

    this.problem = null;
    this.username = null;
    this.nickname = null;
    this.testcaseDict = {};
    this.testgroupDict = {};
    this.testcaseIds = [];
    this.testgroupIds = [];
    this.problemIdx = null;
    this.codeIdx = null;
    this.currStage = null;
    this.userAction = null;

    this.hint = null;
    this.dialogHint = null;

    makeObservable(this, {
      username: observable,
      nickname: observable,
      problem: observable,
      testcaseIds: observable,
      testgroupIds: observable,

      problemIdx: observable,
      codeIdx: observable,
      currStage: observable,
      // two different hint system
      hint: observable,
      dialogHint: observable,
      userAction: observable,
    });
  }

  async setup() {
    const names = await getLogin();
    this.numProblems = await getNumProblem();
    if (names) {
      this.username = names.username;
      this.nickname = names.nickname;

      this.localstore.saveLocal("username", this.username);
      this.localstore.saveLocal("nickname", this.nickname);
    } else {
      this.username = null;
      this.nickname = null;
    }
    // for saving the problem and code index, tracking the stage.
    this.problemIdx = this._initProblemIdx();
    this.codeIdx = this._initCodeIdx();
    this.problem = this._initProblem();
    this.testcaseDict = this._initTestcaseDict();
    this.testcaseIds = this._initTestcaseIds();
    this.testgroupDict = this._initTestgroupDict();
    this.testgroupIds = this._initTestgroupIds();
    this.userAction =
      this.localstore.getLocal("userAction", null) || UserActions.WriteTC;

    this.currStage = this._initStage();
    console.log("this.currStage", this.currStage);

    this.hint = this.localstore.getLocal("hint", null);
    this.dialogHint = this.localstore.getLocal("dialogHint", null);
  }

  /**
   * *************************************************************
   * BELOW: Primary stage switching function
   * *************************************************************
   */
  async setNextStage() {
    console.log(
      this.currStage,
      "problem index",
      this.problemIdx,
      "code index",
      this.codeIdx
    );

    // this.username = await getLogin().username; // will be replaced by undefined
    if (!this.isLogin()) {
      this.setCurrStage(FrontStates.LoginPage);
    }
    // one time entering of the intro page
    if (this.currStage === FrontStates.LoginPage) {
      this.setCurrStage(FrontStates.IntroPage);
      // move from intro page to the next problem
    } else if (this.currStage === FrontStates.IntroPage) {
      // get next problem
      const isNewProblem = this.getNewProblem(this.problemIdx + 1);
      if (isNewProblem) {
        this.setCurrStage(FrontStates.ProblemPage);
        this.setUserAction(UserActions.WriteTC);
        this.getTGInit(this.problemIdx);
      }
    } else if (this.currStage === FrontStates.ProblemPage) {
      if (
        this.problemIdx === this.numProblems - 1 &&
        this.codeIdx === this.problem.numCodes - 1
      ) {
        //this.localstore.resetLocal();
        //this.setup();
        this.setCurrStage(FrontStates.CongratsPage);
      } else {
        this.setCurrStage(FrontStates.QueuePage);
      }
    } else if (this.currStage === FrontStates.QueuePage) {
      // got to the end of all problems, move to congrats page
      if (
        this.problemIdx === this.numProblems - 1 &&
        this.codeIdx === this.problem.numCodes - 1
      ) {
        //this.localstore.resetLocal();
        //this.setup();
        this.setCurrStage(FrontStates.CongratsPage);
      } else if (this.codeIdx === this.problem.numCodes - 1) {
        // finished all possible students for the current problem
        // but still more problems
        // go back to the problem page - Add a note in the problem page to say it's the next problem. Add a status.
        const nextProbIdx = this.problemIdx + 1;
        const isNewProblem = this.getNewProblem(nextProbIdx);
        if (isNewProblem) {
          this.setCurrStage(FrontStates.ProblemPage);
          this.setUserAction(UserActions.WriteTC);
          this.getTGInit(nextProbIdx);
        }
      } else {
        const isNextCode = this.getNewCode(this.codeIdx + 1);
        // get the code and initiate in the problem side
        if (isNextCode) {
          this.codeIdx = this.codeIdx + 1;
          //this.userAction = UserActions.SelectTC;
          this.localstore.saveLocal("codeIdx", this.codeIdx);
          // get back to the chat page
          this.setCurrStage(FrontStates.ChatPage);
          this.setHint(
            AllHints.RunTestSuite.text,
            AllHints.RunTestSuite.isDialogHint
          );
          //this.setUserAction(UserActions.SelectTC);
          // clear the diaolog
        }
      }
    } else if (this.currStage === FrontStates.ChatPage) {
      // whenever in chat page, always return to queue
      // then move to the next stage through queue
      Testcase.resetTestcases(store.testcaseDict);
      store.setUserAction(UserActions.WriteTC);
      // also reset messages
      this.setCurrStage(FrontStates.QueuePage);
    }
  }

  /**
   * *************************************************************
   * BELOW: Deal with code fixing
   * *************************************************************
   */

  async submitExpl(expl_code_id, selectedTC) {
    const response = await postSubmitFix(
      this.problem.getBasics(this.username),
      expl_code_id,
      this.testcaseDict,
      selectedTC
    );
    const prevCode = this.problem.code.code;
    if (response) {
      this.problem.setCode(
        response.fix_code,
        response.fixed_code_name,
        response.fixed_code_path,
        response.ex_fail_inp,
        prevCode
      );
      this.localstore.saveLocal("problem", this.problem.stringfy());
      return response.hint;
    }
    return null;
  }

  async submitDistractor(distractor_name, selectedTC) {
    const response = await postSubmitDistractor(
      this.problem.getBasics(this.username),
      distractor_name,
      this.testcaseDict,
      selectedTC
    );
    if (response) {
      if (response.needAddTest === true) {
        const hint = {
          isDialogHint: AllHints.ConsiderTestCase,
          text:
            response.inp.input_descr +
            AllHints.ConsiderTestCase.text +
            response.inp.input,
        };
        this.setUserAction(UserActions.WriteTC);
        return { hint: hint, diffTest: response.diff_test };
      } else {
        return {
          hint: AllHints.SelectAnotherExpl,
          diffTest: response.diff_test,
        };
      }
    }
  }

  /**
   * *************************************************************
   * BELOW: Deal with tests. Save tests, rerun tests, add tests.
   * *************************************************************
   */

  async evaluateTestSuite() {
    let hint = { text: null, isDialogHint: false };
    if (!this.isHasCode()) {
      console.error("evaluateTests: there is no problem!");
      hint = AllHints.WriteMoreCase;
    }
    const allPassed = await Testcase.evaluateTests(
      this.problem.getBasics(this.username),
      this.testcaseDict
    );
    this.saveTests();
    if (allPassed) {
      const exFailInput = this.problem.getExFailInput();
      if (exFailInput === null) {
        hint = AllHints.AllPassed;
      } else {
        hint = {
          ...AllHints.ConsiderTestCase,
          text: exFailInput.input_descr + AllHints.ConsiderTestCase.text + exFailInput.input,
        };
        this.setUserAction(UserActions.WriteTC);
      }
    } else {
      hint = AllHints.SelectFailedCase;
      this.setUserAction(UserActions.SelectTC);
    }
    this.setHint(hint.text, hint.isDialogHint);
  }

  async addTestcase(input, expected_output) {
    if (!this.isHasProblem()) {
      console.error("addTestcase: No problem!");
    }
    const response = await Testcase.addTestcase(
      input,
      expected_output,
      this.testcaseDict,
      this.problem.getBasics(this.username)
    );

    return response;
  }

  async addTestgroup(title, testlist) {
    if (!this.isHasProblem()) {
      console.error("addTestgroup: No problem!");
    }
    const response = await Testgroup.addTestgroup(
      title,
      testlist,
      this.testgroupDict,
      this.problem.getBasics(this.username)
    );
    if (response.testgroup !== null) {
      const testgroup = response.testgroup;
      this.testgroupDict[testgroup.id] = testgroup;
      this.testgroupIds.push(testgroup.id);
      this.saveTests();
    }
    return response;
  }

  async deleteTestcase(testid) {
    if (
      !(testid in this.testcaseDict) ||
      this.testcaseIds.indexOf(testid) === -1
    ) {
      console.error("deleteTestcase: No such test case!");
      return;
    }
    // remove from existing groups
    Object.values(this.testgroupDict).forEach((testgroup) => {
      testgroup.testlist = testgroup.testlist.filter((tid) => tid !== testid);
    });
    delete this.testcaseDict[testid];
    const index = this.testcaseIds.indexOf(testid);
    // update backend
    this.testcaseIds.splice(index, 1);
    this.saveTests();
    console.log(this.testcaseIds);
  }

  async deleteTestgroup(groupid) {
    if (!this.isHasProblem()) {
      console.error("addTestgroup: No problem!");
    }
    if (groupid === DEFAULT_TESTGROUP_ID) {
      console.error("addTestgroup: Cannot delete default test group!");
      return;
    }
    if (
      !(groupid in this.testgroupDict) ||
      this.testgroupIds.indexOf(groupid) === -1
    ) {
      console.error("addTestgroup: No such test group!");
    }
    const testgroup = this.testgroupDict[groupid];
    // move test cases to ungrouped
    this.testgroupDict[DEFAULT_TESTGROUP_ID].testlist = this.testgroupDict[
      DEFAULT_TESTGROUP_ID
    ].testlist.concat(testgroup.testlist);
    // delete the test group
    delete this.testgroupDict[groupid];
    const index = this.testgroupIds.indexOf(groupid);
    // update backend
    await postUpdateTG(
      this.problem.getBasics(this.username),
      "deleteTG",
      testgroup
    );
    this.testgroupIds.splice(index, 1);
    this.saveTests();
  }

  async moveTestcase(source, destination, draggableId) {
    const testcase = this.testcaseDict[draggableId];
    const fromgroup = this.testgroupDict[source.droppableId];
    const togroup = this.testgroupDict[destination.droppableId];
    Testgroup.moveTestcase(
      fromgroup,
      togroup,
      testcase,
      this.problem.getBasics(this.username)
    );
    this.saveTests();
  }

  async moveTestgroup(source, destination, draggableId) {
    const newTestgroupOrder = [...this.testcaseIds];
    newTestgroupOrder.splice(source.index, 1);
    newTestgroupOrder.splice(destination.index, 0, draggableId);
    await postUpdateTG(this.problem.getBasics(this.username), "reorderTG", {
      oldOrder: this.testgroupIds,
      newOrder: newTestgroupOrder,
    });
    this.testgroupIds = newTestgroupOrder;

    this.saveTests();
  }

  saveTests() {
    const alltests = Object.values(this.testcaseDict).map((test) => {
      return test.stringfy();
    });
    const testgroups = Object.values(this.testgroupDict).map((testgroup) => {
      return testgroup.stringfy();
    });
    this.localstore.saveLocal("testcaseDict", alltests);
    this.localstore.saveLocal("testgroupDict", testgroups);
    this.localstore.saveLocal("testcaseIds", [...this.testcaseIds]);
    this.localstore.saveLocal("testgroupIds", [...this.testgroupIds]);

    this.setHint("", false);
  }

  /**
   * *************************************************************
   * BELOW: Initialization Code
   * *************************************************************
   */

  _initProblem() {
    let problem = new Problem();
    let savedProblem = this.localstore.getLocal("problem", null);
    if (savedProblem !== null) {
      problem = new Problem(
        savedProblem.problem_name,
        savedProblem.description,
        savedProblem.numCodes
      );
      problem.setCode(
        savedProblem.buggy_code,
        savedProblem.buggy_code_name,
        savedProblem.buggy_impl_path,
        savedProblem.ex_fail_inp,
        savedProblem.old_code
      );
      console.log("_initProblem", savedProblem, problem.code);
    } else {
      problem = new Problem();
    }
    return problem;
  }

  _initStage() {
    let savedStage = this.localstore.getLocal("stage", null);
    console.log(savedStage, this.isLogin());
    if (savedStage === null) {
      savedStage = this.isLogin()
        ? FrontStates.IntroPage
        : FrontStates.LoginPage;
    }
    return savedStage;
  }

  _initTestcaseDict(isReset = false) {
    let testcases = {};
    if (!isReset) {
      let savedTestcases = this.localstore.getLocal("testcaseDict", null);
      if (this.isHasProblem() && savedTestcases !== null) {
        savedTestcases.forEach((test) => {
          const testcase = new Testcase(
            test.input,
            test.expected_output,
            this.problem.problem_name,
            test.id
          );
          testcase.set_actual_behavior(test.actual_behavior);
          testcase.set_evaluation(test.has_been_evaluated);
          testcase.set_pf(test.pf);
          testcases[testcase.id] = testcase;
        });
      }
    }
    return testcases;
  }

  _initTestgroupDict(isReset = false) {
    let testgroups = {};
    const defaultTestgroup = new Testgroup(
      "Default Group",
      [],
      DEFAULT_TESTGROUP_ID
    );
    testgroups[defaultTestgroup.id] = defaultTestgroup;
    if (!isReset) {
      let savedTestgroups = this.localstore.getLocal("testgroupDict", null);
      if (savedTestgroups !== null) {
        //testgroups = {};
        savedTestgroups.forEach((testgroup) => {
          const tg = new Testgroup(
            testgroup.title,
            testgroup.testlist,
            testgroup.id
          );
          testgroups[tg.id] = tg;
        });
      }
    }
    return testgroups;
  }

  _initProblemIdx() {
    return this.localstore.getLocal("problemIdx", -1);
  }
  _initCodeIdx() {
    return this.localstore.getLocal("codeIdx", -1);
  }

  _initTestcaseIds(isReset = false) {
    let testcaseIds = [];
    let savedTestcaseIds = this.localstore.getLocal("testcaseIds", null);
    if (!isReset && savedTestcaseIds !== null) {
      testcaseIds = savedTestcaseIds;
    } else {
      testcaseIds = Object.keys(this.testcaseDict);
    }

    return testcaseIds;
  }

  _initTestgroupIds(isReset = false) {
    let testgroupIds = [];
    let savedTestgroupIds = this.localstore.getLocal("testgroupIds", null);
    if (!isReset && savedTestgroupIds !== null) {
      testgroupIds = savedTestgroupIds;
    } else {
      testgroupIds = Object.keys(this.testgroupDict);
    }

    return testgroupIds;
  }

  /**
   * *************************************************************
   * BELOW: Helper functions on set information or check status
   * *************************************************************
   */

  async getNewProblem(nextProbIdx) {
    this.testcaseDict = this._initTestcaseDict(true);
    this.testcaseIds = this._initTestcaseIds(true);
    this.testgroupDict = this._initTestgroupDict(true);
    this.testgroupIds = this._initTestgroupIds(true);
    const rawProblem = await getProblem(nextProbIdx);
    if (rawProblem) {
      this.problem = new Problem(
        rawProblem.problem_name,
        rawProblem.description,
        rawProblem.num_codes
      );
      // add one more problem, added in stage already, this maybe duplicate?
      this.problemIdx += 1;
      // reset the code index
      this.codeIdx = -1;

      // reset the testcases
      this.localstore.saveLocal("problem", this.problem.stringfy());
      this.localstore.saveLocal("codeIdx", this.codeIdx);
      this.localstore.saveLocal("problemIdx", this.problemIdx);
      return true;
    }
    return false;
  }
  async getNewCode(nextIdx) {
    const code = await getCode(this.problem.getBasics(this.username), nextIdx);
    if (code) {
      this.problem.setCode(
        code.code,
        code.buggy_code_name,
        code.buggy_impl_path,
        code.ex_fail_inp,
        code.old_code
      );
      /* updated when setNextStudent, brefore setStage
      Testcase.resetTestcases(this.testcaseDict);
      Testcase.evaluateTests(
        this.problem.getBasics(this.username),
        this.testcaseDict
      );
      this.saveTests();
      */
      this.localstore.saveLocal("problem", this.problem.stringfy());
      return true;
    }
    return false;
  }

  // pull from backend to init + 3 hint testgroups
  async getTGInit(nextProbIdx) {
    const testgroups = await getTGInit(nextProbIdx);
    if (testgroups) {
      testgroups.init_testgroup.forEach((testgroup, i) => {
        //, "INIT" + (i + 1)
        const tg = new Testgroup(testgroup, []);
        this.testgroupDict[tg.id] = tg;
        this.testgroupIds.push(tg.id);
      });
      this.saveTests();
      return true;
    }
  }
  setHint(text, isDialogHint) {
    if (isDialogHint) {
      this.dialogHint = text;
    } else {
      this.hint = text;
    }
    this.localstore.saveLocal("hint", this.hint);
    this.localstore.saveLocal("dialogHint", this.dialogHint);
  }

  setUserAction(action) {
    this.userAction = action;
    this.localstore.saveLocal("userAction", action);
  }

  setCurrStage(stage) {
    this.currStage = stage;
    this.localstore.saveLocal("stage", stage);
  }

  setLogin(username, nickname) {
    store.localstore.assignmentId = username;
    this.localstore = new LocalStore("localstore", [], username, true);
    this.username = username;
    this.nickname = nickname;
  }
  isLogin() {
    return this.username !== null;
  }

  isHasProblem() {
    return this.problem !== null && this.problem.isHasProblem();
  }
  isHasCode() {
    return this.isHasProblem() && this.problem.isHasCode();
  }
}

export const store = new Store();
