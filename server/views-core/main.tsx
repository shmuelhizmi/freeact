import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Error as ErrorCom } from "./error";
import "./index.css";

const root = document.createElement("div") as HTMLDivElement;
root.id = "root__temp";
document.body.appendChild(root);
root.style.display = "none";

new Promise<void>((resolve) => {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App onLoad={() => resolve()} />
    </React.StrictMode>
  );
})
  .then(() => {
    document.body.removeChild(document.getElementById("root")!);
    root.id = "root";
    root.style.display = "block";
    document.body.appendChild(root);
  })
  .catch((error) => {
    ReactDOM.createRoot(document.body).render(
      <React.StrictMode>
        <ErrorCom error={error} />
      </React.StrictMode>
    );
  });
