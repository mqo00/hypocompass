/**
Things saved:

1. username
2. problem index, and the actual problem
3. code index - not the actual code
4. test cases - don't save the tested behavior
6. test groups
7. test case index
8. test group index
9. userAction
10. currStage
11. hints and dialoghint
 */

export class LocalStore {
  constructor(namespace, additionKeys, assignmentId, isDebug) {
    this._namespace = typeof namespace === "string" ? namespace : "";
    this.assignmentId = assignmentId;
    this.isDebug = isDebug;
    this._local = {};
    this._load(additionKeys);
  }

  _load(additionKeys, namespace) {
    const urlParams = new URLSearchParams(window.location.search);
    this._local = {};
    if (namespace !== null) {
      this._namespace = namespace;
    }
    if (this.assignmentId) {
      this._namespace += this.assignmentId;
    }
    try {
      const item = localStorage.getItem(this._namespace + ":local");
      if (item === null || item.length === 0) {
        throw new Error("No record exists");
      }
      this._local = JSON.parse(item);
    } catch (e) {
      this._local = {};
    }

    for (let key of additionKeys) {
      const v = urlParams.get(key);
      if (v !== null) {
        this._local[key] = v;
      }
    }
  }

  getSubmitUrl() {
    const extra = this.submitTarget === null ? "" : this.submitTarget;
    return `${extra}/mturk/externalSubmit`;
  }

  getState() {
    if (this.assignmentId === null || typeof this.assignmentId !== "string") {
      return "unloaded";
    } else if (this.assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE") {
      return "preview";
    } else {
      return "ready";
    }
  }

  persistenceAvailable() {
    try {
      localStorage.setItem(this._namespace + ":test", "test");
      localStorage.removeItem(this._namespace + ":test");
      return true;
    } catch (e) {
      return false;
    }
  }

  saveLocal(key, value) {
    this._local[key] = value;
    try {
      localStorage.setItem(
        this._namespace + ":local",
        JSON.stringify(this._local)
      );
    } catch (e) {}
  }

  getLocal(key, defaultValue, forceRefresh) {
    //return null;
    if (forceRefresh && this.persistenceAvailable()) {
      try {
        this._local = JSON.parse(
          localStorage.getItem(this._namespace + ":local")
        );
      } catch (e) {}
    }
    return key in this._local ? this._local[key] : defaultValue;
  }

  resetLocal() {
    this._local = {};
    try {
      localStorage.setItem(
        this._namespace + ":local",
        JSON.stringify(this._local)
      );
    } catch (e) {}
  }
}
