import { useForm } from "react-hook-form";
import Popup from "reactjs-popup";
import { useState } from "react";
import "./Testsuite.css";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";
import { UserActions } from "../../stores/utils";

export const Addtestgroup = observer(({ userAction }) => {
  const [isAddTestGroup, setIsAddTestGroup] = useState(false);
  const {
    register,
    resetField,
    handleSubmit,
    // formState: { errors },
  } = useForm({ defaultValues: { input: "", expected_output: "" } });

  const clearInputFields = () => {
    resetField("groupname");
  };

  // send POST to backend, make both functions async/await to get the return values
  const addTestgroup = async (title) => {
    const response = await store.addTestgroup(title, []);
    // check Duplicates if tetscase input already exist in alltests
    if (response.isDup) {
      store.setHint("Please enter a valid group name.", false);
      clearInputFields();
      return;
    }
    clearInputFields();
    return;
  };

  const onSubmit = (data) => {
    addTestgroup(data.groupname, []);
  };

  return (
    <form className="oneline" onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={userAction === UserActions.SelectTC}>
        <label>Add Test Group:</label>
        <input
          id="add-test-group"
          type="text"
          {...register("groupname")}
          className="testtextbox"
          placeholder="Enter test group name"
          onClick={() => {
            setIsAddTestGroup(true);
          }}
          onMouseOut={() => {
            setIsAddTestGroup(false);
          }}
        />
        <Popup
          open={isAddTestGroup}
          trigger={<span></span>}
          position="right center"
        >
          Please use meaningful names to describe the test group.
        </Popup>
        <input type="submit" value="+" />
      </fieldset>
    </form>
  );
});
