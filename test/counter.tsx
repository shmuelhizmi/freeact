import React, { useState } from "../modules/joy/server/react";

function App() {
  const [count, setCount] = useState(0);
  return (
    <React.JOY.Box rows={["45px", "50%"]} columns="70%" gap={35}>
      <React.JOY.Typography variant="solid" type="h1">
        Counter App
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
    </React.JOY.Box>
  );
}

React.serve(() => <App />, {
  title: "Counter App",
  runFrom: "chrome-app",
});
