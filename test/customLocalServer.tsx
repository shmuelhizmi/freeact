import React, { useState, socketIoToTransport } from "../server";
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
    <React.Box rows={["45px", "25%", "30%"]} columns="70%" gap={35}>
      <React.Typography variant="solid" type="h1">
        The Terminal Output Counter
      </React.Typography>
      <React.Box
        variant="soft"
        columns={"100%"}
        rows={["25%", "65%"]}
        gap={"5%"}
        padding={"5%"}
      >
        <React.Typography type="h2">Count: {count}</React.Typography>
        <React.Button
          onClick={() => setCount(count + 1)}
          variant="outlined"
          color="primary"
          label="increment"
        />
      </React.Box>
      <React.Terminal
        initialExecution={{ shell: "zsh", args: ["-c", 'echo "freeact";zsh'] }}
        onData={() => setCount((c) => c + 1)}
      />
    </React.Box>
  );
}

React.serve(() => <App />, {
  connection: {
    basePath: "/dev/",
    httpServer: server,
  },
  runFrom: "browser",
});
