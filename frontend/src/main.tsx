import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// React 앱의 진입점이다.
// TODO: BrowserRouter, 전역 인증 상태, 에러 바운더리를 연결한다.
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("React root element를 찾을 수 없습니다.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
