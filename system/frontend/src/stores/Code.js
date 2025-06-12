import { makeObservable, observable } from "mobx";

export class Code {
  constructor(
    buggy_code = null,
    buggy_code_name = null,
    buggy_impl_path = null,
    ex_fail_inp = null,
    old_code = null
  ) {
    this.buggy_code = buggy_code;
    this.buggy_code_name = buggy_code_name;
    this.buggy_impl_path = buggy_impl_path;
    this.code = buggy_code;
    this.old_code = old_code;
    this.ex_fail_inp = ex_fail_inp;

    makeObservable(this, {
      code: observable,
      old_code: observable,
      ex_fail_inp: observable,
    });
  }

  getBasics() {
    return {
      buggy_code: this.buggy_code,
      buggy_code_name: this.buggy_code_name,
      buggy_impl_path: this.buggy_impl_path,
    };
  }
  stringfy() {
    return {
      ...this.getBasics(),
      code: this.code,
      old_code: this.old_code,
      ex_fail_inp: this.ex_fail_inp,
    };
  }
  isHasCode() {
    return this.code !== null;
  }
}
