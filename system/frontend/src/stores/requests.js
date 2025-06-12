import axios from "axios";

// frontend GET session username to see if user logged in
async function getLogin() {
  return axios
    .get("/login")
    .then(function (response) {
      if (response.data === "User has not logged in yet") {
        return null;
      }
      console.log("getLogin: ", response.data, "already logged in");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
}

// frontend POST login username to set session variable
async function postLogin(username, nickname) {
  return axios
    .post("/login", { username: username, nickname: nickname })
    .then(function (response) {
      console.log(response);
      return username;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
}

// frontend POST logout to clear session variable
async function postLogout() {
  return axios
    .post("/logout")
    .then(function (response) {
      console.log(response);
      return true;
    })
    .catch(function (error) {
      console.log(error);
      return false;
    });
}

async function getNumProblem() {
  return axios
    .post("/get-num-problem")
    .then(function (response) {
      // an int number
      console.log("get-num-problem", response);
      return response.data["num_problem"];
    })
    .catch(function (error) {
      console.log(error);
      return 0;
    });
}

// frontend GET problem to display
async function getProblem(problemIdx) {
  return axios
    .post("/display-problem", { problem_idx: problemIdx })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
}

async function getTGInit(index) {
  return axios
    .post("/display-testgroup", { problem_index: index })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
}

async function getCode(problem, index) {
  return axios
    .post("/display-code", { user: index, problem_name: problem.problem_name })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
}

// frontend POST the newly added TC to server to store data
// backend verify if user's expected output was correct
async function postAddTC(basics, input, expected_output) {
  try {
    const response = await axios.post("/add-tc", {
      basics: basics,
      input: input,
      expected_output: expected_output,
    });
    console.log("Async POSTAddTC Response = ", response.data);
    return response.data; // true/false & actual expected output
  } catch (error) {
    console.error(error);
    return null;
  }
}

// frontend POST the simple type of update with TG
// (addTG, deleteTG, renameTG, reorderTG, reorderTC)
function postUpdateTG(basics, action, testgroup) {
  // id, title, testlist fields
  axios
    .post("/update-tg", {
      basics: basics,
      action: action,
      testgroup: testgroup,
    })
    .then(function (response) {
      console.log("POST updateTC Response =", response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

// frontend POST run all tests
async function postRunAllTests(basics, tests) {
  try {
    const response = await axios.post("/run-all-tests", {
      basics: basics,
      tests: tests,
    });
    console.log("Async POST runAllTests Response = ", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// frontend POST submitTCSelection and change code accordingly
async function postSubmitFix(basics, expl_code_id, testlist, selectedTC) {
  try {
    const response = await axios.post("/submit-fix", {
      basics: basics,
      expl_code_id: expl_code_id,
      testlist: testlist,
      selectedTC: selectedTC,
    });
    console.log("Async POST submitFix Response = ", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// frontend POST submitDistractor and send dialog & update hint accordingly
async function postSubmitDistractor(
  basics,
  distractor_name,
  test_suite,
  selectedTC
) {
  try {
    const response = await axios.post("/submit-distractor", {
      basics: basics,
      distractor_name: distractor_name,
      test_suite: test_suite,
      selectedTC: selectedTC,
    });
    console.log("Async POST submitDistractor Response = ", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function saveButtons(basics, action) {
  axios
    .post("/save-buttons", { basics: basics, action: action })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

// frontend POST the code name to server to store data
// backend send back expl pool options & other feedback data
async function postShowExplPool(basics) {
  try {
    console.log(basics);
    const response = await axios.post("/display-expl-pool", { basics: basics });
    console.log("Async POST postShowExplPool Response = ", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}


export {
  postLogin,
  getLogin,
  postLogout,
  getProblem,
  getTGInit,
  getCode,
  postRunAllTests,
  postAddTC,
  postUpdateTG,
  postSubmitFix,
  postSubmitDistractor,
  postShowExplPool,
  saveButtons,
  getNumProblem,
};
