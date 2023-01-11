import React, { useState } from "../modules/joy/server/react";
import http from "http";

const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
    <html>
      <head>
        <title>Freeact Demo</title>
      </head>
      <body>
        <div style="display: block; margin: 0 auto; width: 100%; text-align: center;">
          <a href="/dev/">Start</a>
          <a href="/dev">Start (redirect)</a>
        </div>
      </body>
    </html>
    `);
  }
});
server.listen(4433);

function App() {
  const [count, setCount] = useState(69);
  return (
    <React.JOY.Box rows={["45px", "25%", "30%"]} columns="70%" gap={35}>
      <React.JOY.Typography variant="solid" type="h1">
        The Terminal Output Counter
      </React.JOY.Typography>
      <React.JOY.Box
        variant="soft"
        columns={"100%"}
        rows={["25%", "65%"]}
        gap={"5%"}
        padding={"5%"}
      >
        <React.JOY.Typography type="h2">Count: {count}</React.JOY.Typography>
        <React.JOY.Button
          onClick={() => setCount(count + 1)}
          variant="outlined"
          color="primary"
          label="increment"
        />
      </React.JOY.Box>
      {/* <React.JOY.Terminal
        initialExecution={{ shell: "zsh", args: ["-c", 'echo "freeact";zsh'] }}
        onData={() => setCount((c) => c + 1)}
      /> */}
    </React.JOY.Box>
  );
}

React.serve(() => <App />, {
  connection: {
    basePath: "/dev/",
    httpServer: server,
  },
  runFrom: "browser",
});
