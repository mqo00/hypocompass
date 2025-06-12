import { useForm } from "react-hook-form";
import { postLogin } from "../../stores/requests";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";
import { FrontStates } from "../../stores/utils";

export const Login = observer(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = async (data) => {
    await postLogin(data.username, data.nickname);
    // also save to local storage
    store.setLogin(data.username, data.nickname);
    if (store.currStage === FrontStates.LoginPage) {
      await store.setNextStage();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-page">
        <h1>Login</h1>
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Participant id:{" "}
            <input
              type="text"
              {...register("username", {
                required: "An username is required.",
              })}
              placeholder="S1"
            />
          </label>
          <label>
            Your nickname:{" "}
            <input
              type="text"
              {...register("nickname", { required: "A nickname is required." })}
              placeholder="First name"
            />
          </label>
          <p className="error-msg">
            {errors.username?.message} {errors.nickname?.message}{" "}
          </p>
          <button className="login-btn" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
});
