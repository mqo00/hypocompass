import { useForm } from "react-hook-form";
import Popup from "reactjs-popup";
import { useState } from "react";
import "./Testsuite.css";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";
import {
  AllHints,
  UserActions,
  isSufficientTestcases,
} from "../../stores/utils";
import { DEFAULT_TESTGROUP_ID } from "../../stores/Testgroup"; // Testgroup

export const Addtest = observer(({ userAction }) => {
  const {
    register,
    resetField,
    handleSubmit,
    // formState: { errors },
  } = useForm({ defaultValues: { input: "", expected_output: "" } });

  const clearInputFields = () => {
    resetField("input");
    resetField("expected_output");
  };

  // send POST to backend, make both functions async/await to get the return values
  const addTestcase = async (input, expected_output) => {
    const response = await store.addTestcase(input, expected_output);
    // case1: check if there's a test case already
    if (response.isDup) {
      store.setHint(
        AllHints.DuplicateTestcase.text,
        AllHints.DuplicateTestcase.isDialogHint
      );
      clearInputFields();
      return;
    }

    if (response.tc_correct === null) {
      store.setHint(
        AllHints.GeneralWrongTestcase.text,
        AllHints.GeneralWrongTestcase.isDialogHint
      );
      clearInputFields();
      return;
    }

    // case2: set hint message if testcase is not correct
    if (!response.tc_correct) {
      if (response.refsol_output === "raise Exception") {
        // invalid tc, (don't use !refsol_output, because it is also true for 0)
        // don't use refsol_output == null either, because it is also true for None
        store.setHint(
          AllHints.InvalidTestcase.text,
          AllHints.InvalidTestcase.isDialogHint
        );
        return;
      } else {
        // wrong output
        store.setHint(
          `The correct expected output is ${response.refsol_output}, please try again.`,
          // "The correct expected output is " + response.refsol_output + ", please try again.",
          false
        );
        return;
      }
    }

    if (response.testcase) {
      const testcase = response.testcase;
      testcase.set_pf(response.pf);
      testcase.set_actual_behavior(response.behavior);
      store.testcaseDict[testcase.id] = testcase;
      store.testcaseIds.push(testcase.id);
      store.testgroupDict[DEFAULT_TESTGROUP_ID].testlist.push(testcase.id);
      store.saveTests();
    }

    if (store.isHasCode()) {
      store.setHint(
        AllHints.RunTestSuite.text,
        AllHints.RunTestSuite.isDialogHint
      );
    } else {
      store.setHint("", true);
    }
    store.setHint("", false);

    clearInputFields();
    return;
  };

  const onSubmit = async (data) => {
    await addTestcase(data.input, data.expected_output);
  };

  const [isInput, setIsInput] = useState(false);
  const [isOutput, setIsOutput] = useState(false);

  return (
    <form className="oneline" onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={userAction === UserActions.SelectTC}>
        <label>Add Test Case: </label>
        <input
          onClick={() => {
            if (!isSufficientTestcases(store.testcaseIds)) {
              setIsInput(true);
              setIsOutput(false);
            }
          }}
          onMouseOut={() => {
            setIsInput(false);
          }}
          id={"add-test-input"}
          className={`testtextbox ${"no-error"}`}
          {...register("input", { required: "An input is required." })}
          placeholder="Input"
        ></input>

        <Popup open={isInput} trigger={<span></span>} position="right center">
          Please add input with different variables separated by ",". For
          example, to test <code>func(A, B)</code> with <code>A=[0,1]</code> and{" "}
          <code>B=["1", "2"]</code>, input <code>[0, 1], ["1", "2"]</code>
        </Popup>

        <input
          id="add-test-output"
          onClick={() => {
            if (!isSufficientTestcases(store.testcaseIds)) {
              setIsInput(false);
              setIsOutput(true);
            }
          }}
          onMouseOut={() => {
            setIsOutput(false);
          }}
          className={`testtextbox ${"no-error"}`}
          {...register("expected_output", {
            required: "An expected output is required.",
          })}
          placeholder="Expected output"
        />

        <Popup open={isOutput} trigger={<span></span>} position="right center">
          Write the expected output, similar to the input format.
        </Popup>
        <input id="add-test-submit" type="submit" value="+" />

        {/* <p className="error-msg">
          {errors.input?.message} {errors.expected_output?.message}
        </p> */}
      </fieldset>
    </form>
  );
});
