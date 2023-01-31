import React, { useState } from "@freeact/joy/react";
import { Box, Typography, Button } from "@freeact/joy/ui";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Box rows={["45px", "50%"]} columns="70%" gap={35}>
      <Typography variant="solid" type="h1">
        Counter App
      </Typography>
      <Box
        variant="soft"
        columns={"100%"}
        rows={["25%", "65%"]}
        gap={"5%"}
        padding={"5%"}
      >
        <Typography type="h2">Count: {count}</Typography>
        <Button
          onClick={() => setCount(count + 1)}
          variant="outlined"
          color="primary"
          label="increment"
        />
      </Box>
    </Box>
  );
}

React.serve(() => <App />, {
  title: "Counter App",
  runFrom: "chrome-app",
});
