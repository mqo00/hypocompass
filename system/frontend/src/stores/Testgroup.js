import { store } from "./Store";
import { postUpdateTG } from "./requests";
import { genID } from "./utils";
import { makeObservable, observable } from "mobx";

/*
test group:
- static: num_all_group: int (number of all groups ever created, including deleted ones)
- id: string, always be TG+(num_all_group+1)
- title: string
- testlist: array of test cases
*/
export const DEFAULT_TESTGROUP_ID = "DEFAULT_GROUP";

export class Testgroup {
  static deduplicate(title, testgroupDict) {
    // TODO: check it so that the space in between doesn't matter? maybe in other code, space matters!
    const duplicateTC = Object.values(testgroupDict).filter(
      (tc) => tc.title === title
    );
    return duplicateTC.length > 0;
  }
  static async addTestgroup(title, testlist, testgroupDict, problemBasics) {
    const output = {
      isDup: false,
      testgroup: null,
    };
    const isDup = Testgroup.deduplicate(title, testgroupDict);
    if (isDup || title === "") {
      output.isDup = true;
      return output;
    }
    const testgroup = new Testgroup(title, testlist);
    await postUpdateTG(problemBasics, "addTG", testgroup.stringfy());
    output.testgroup = testgroup;

    return output;
  }

  static async moveTestcase(fromgroup, togroup, testcase, problemBasics) {
    const testcaseId = testcase.id;
    if (fromgroup.id === togroup.id) {
      return;
    }
    const currIdx = fromgroup.testlist.indexOf(testcaseId);
    if (currIdx === -1) {
      console.log("Cannot find testcase in testgroup");
      return;
    }
    fromgroup.testlist.splice(currIdx, 1);
    togroup.testlist.push(testcaseId);
    await postUpdateTG(problemBasics, "reorderTC", {
      fromTG: fromgroup.title,
      toTG: togroup.title,
      moveTC: testcase.testString,
    });
  }

  constructor(title, testlist, id = null) {
    this.id = id || genID();
    // make id string so draggableID & dropppbleId can directly use them
    this.title = title;
    this.testlist = testlist;
    makeObservable(this, {
      title: observable,
      testlist: observable,
    });
  }

  isDefaultGroup() {
    return this.id === DEFAULT_TESTGROUP_ID;
  }

  async setTitle(title, problem, sendToBackend = false) {
    if (title !== "") {
      this.title = title;
      // only submit if the key event is enter, otherwise just display
      if (sendToBackend) {
        await postUpdateTG(problem.getBasics(store.username), "renameTG", this.stringfy());
      }
      store.saveTests();
    } else {
      console.log("Testgroup title cannot be empty");
    }
  }

  stringfy() {
    return {
      id: this.id,
      title: this.title,
      testlist: this.testlist, //.map((testcase) => testcase.id),
    };
  }
}
