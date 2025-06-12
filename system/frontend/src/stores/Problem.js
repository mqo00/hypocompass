import { Code } from "./Code";
import { makeObservable, observable } from "mobx";

export class Problem {
  constructor(problem_name = null, description = null, numCodes = null) {
    this.problem_name = problem_name;
    this.description = description;
    this.numCodes = numCodes;
    this.code = null;
    makeObservable(this, {
      code: observable,
      numCodes: observable,
    });
  }

  setCode(
    buggy_code = null,
    buggy_code_name = null,
    buggy_impl_path = null,
    ex_fail_inp = null,
    old_code = null
  ) {
    if (
      buggy_code === null ||
      buggy_code_name === null ||
      buggy_impl_path === null
    ) {
      console.log("Problem - SetCode - some information is null");
      this.code = null;
    } else {
      this.code = new Code(
        buggy_code,
        buggy_code_name,
        buggy_impl_path,
        ex_fail_inp,
        old_code
      );
    }
  }
  resetCode() {
    this.code = null;
  }
  getBasics(userid) {
    if (userid === null) throw new Error("Code: userid is null");
    const codeBasics = this.isHasCode() ? this.code.getBasics() : {};
    return {
      userid: userid,
      problem_name: this.problem_name,
      description: this.description,
      ...codeBasics,
    };
  }

  stringfy() {
    const codeBasics = this.isHasCode() ? this.code.stringfy() : {};
    return {
      problem_name: this.problem_name,
      description: this.description,
      numCodes: this.numCodes,
      ...codeBasics,
    };
  }

  isHasProblem() {
    return this.problem_name !== null && this.description !== null;
  }

  isHasCode() {
    return this.code !== null && this.code.isHasCode();
  }

  isHasDiffCode() {
    return this.isHasCode() && this.code.old_code;
  }

  getExFailInput() {
    if (!this.isHasCode()) {
      throw new Error("Problem: no code");
    }
    return this.code.ex_fail_inp;
  }
}
