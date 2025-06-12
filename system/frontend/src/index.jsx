import React from "react"; // , { StrictMode }
import ReactDOM from "react-dom";
import "./components/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./components/App";
import { store } from "./stores/Store";
ReactDOM.render(
  <React.StrictMode>
    <App username={store.username} currStage={store.currStage} />
  </React.StrictMode>,
  document.getElementById("root")
);