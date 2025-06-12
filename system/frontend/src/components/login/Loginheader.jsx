import { postLogout } from "../../stores/requests";
import { store } from "../../stores/Store";
import { observer } from "mobx-react-lite";

export const Loginheader = observer(({ username }) => {
  //const username = store.username;

  const onLogout = async () => {
    await postLogout();
    store.localstore.resetLocal(); 
    await store.setup();
  };
  return (
    <div style={{ width: "100%", textAlign: "right" }}>
      <label className="user-name">Logged in as: {username}</label>
      <label
        className="logout"
        onClick={() => {
          onLogout();
        }}
      >
        Logout
      </label>
    </div>
  );
});
