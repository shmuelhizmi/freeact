import React, { useState, socketIoToTransport } from "../server";
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "*",
  },
});
const PORT = 4433;
io.listen(PORT);

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
  customConnection: {
    client: {
      type: "HTTP-SOCKET",
      port: PORT,
    },
    server: {
      customTransport: socketIoToTransport(io),
    },
  },
  runFrom: "browser",
});
