import React, { useState } from "../server";

function App() {
  const [count, setCount] = useState(0);
  return (
    <React.Box rows={["45px", "50%"]} columns="70%" gap={35}>
      <React.Typography variant="solid" type="h1">
        Counter App
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
    </React.Box>
  );
}

React.serve(() => <App />, {
  title: "Counter App",
  runFrom: "chrome-app",
});
