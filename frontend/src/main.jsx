import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

// React 앱의 진입점이다.
// TODO: BrowserRouter, 전역 인증 상태, 에러 바운더리를 연결한다.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
