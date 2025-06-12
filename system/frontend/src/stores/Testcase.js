import { postAddTC, postRunAllTests } from "./requests";
import { genID } from "./utils";
import { makeObservable, observable } from "mobx";

/*
  test case: 
  - id: string (a unique id assigned when created, TC+ num_all_testcases + 1)
  - input: string
  - expected_output: string
  - pf: boolean (null if not evaluated)
  - actual_behavior: string (null if not evaluated)
  */
export class Testcase {
  static async evaluateTests(problemBasics, testcaseDict) {
    const response = await postRunAllTests(problemBasics, testcaseDict);
    let allPassed = true;
    // run all the tests
    for (const testidx of Object.keys(testcaseDict)) {
      testcaseDict[testidx].set_pf(response.tests[testidx]["pf"]);
      allPassed = allPassed && response.tests[testidx]["pf"];
      testcaseDict[testidx].set_actual_behavior(
        response.tests[testidx]["actual_behavior"]
      );
      testcaseDict[testidx].set_evaluation(true);
    }
    return allPassed;
  }

  static resetTestcases(testcaseDict) {
    for (const testidx of Object.keys(testcaseDict)) {
      testcaseDict[testidx].set_evaluation(false);
      testcaseDict[testidx].set_pf(null);
      testcaseDict[testidx].set_actual_behavior(null);
    }
  }

  static deduplicate(input, expected_output, testcaseDict) {
    const duplicateTC = Object.values(testcaseDict).filter(
      (tc) => tc.input === input //tc.expected_output === expected_output
    );
    console.log(
      "Testcase deduplicate - duplicate test cases",
      duplicateTC,
      testcaseDict,
      input
    );
    return duplicateTC.length > 0;
  }

  static async addTestcase(
    input,
    expected_output,
    testcaseDict,
    problemBasics
  ) {
    const output = {
      isDup: false,
      testcase: null,
      tc_correct: false,
      refsol_output: null,
      pf: null,
      behavior: null,
    };
    const isDup = Testcase.deduplicate(input, expected_output, testcaseDict);
    if (isDup > 0) {
      output.isDup = true;
      return output;
    }
    // add the testcase to the testcaseDict
    const response = await postAddTC(problemBasics, input, expected_output);
    if (response !== null) {
      output.tc_correct = response.tc_correct;
      output.refsol_output = response.refsol_output;
      output.pf = response.pf;
      output.behavior = response.behavior;
      output.testcase = new Testcase(
        input,
        expected_output,
        problemBasics.problem_name
      );
    }
    return output;
  }

  constructor(input, expected_output, problem_name, id = null) {
    this.id = id || genID();
    this.input = input;
    this.expected_output = expected_output;
    this.pf = null;
    this.has_been_evaluated = false;
    this.actual_behavior = null;
    this.problem_name = problem_name;
    this.testString =
      "assert(" + problem_name + "(" + input + ") == " + expected_output + ")";
    console.log("Created TC id", this.id, this.testString);
    makeObservable(this, {
      has_been_evaluated: observable,
      actual_behavior: observable,
      pf: observable,
    });
  }

  stringfy() {
    // always save just the test case, not the actual test result
    return {
      id: this.id,
      input: this.input,
      expected_output: this.expected_output,
      pf: this.get_pf(),
      has_been_evaluated: this.has_been_evaluated,
      actual_behavior: this.get_actual_behavior(),
    };
  }

  get_pf() {
    if (this.pf === null) {
      throw new Error("no pf for testcase");
    }
    return this.pf;
  }

  set_pf(pf) {
    this.pf = pf;
  }

  set_evaluation(tf) {
    this.has_been_evaluated = tf;
  }

  get_actual_behavior() {
    if (this.actual_behavior === null) {
      throw new Error("no behavior entry for testcase");
    }
    return this.actual_behavior;
  }
  // todo: to avoid typing exactly the same string, need class with value Exception, Nonspecified, and string
  set_actual_behavior(actual_behavior) {
    this.actual_behavior = actual_behavior;
  }
}
