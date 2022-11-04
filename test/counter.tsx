import React, { useState } from "react";
import ui from '../server'


function App() {
    const [count, setCount] = useState(0);
    return (
        <ui.Box rows={["45px", "50%"]} columns="70%" gap={35}>
            <ui.Typography variant="solid" type="h1">Counter App</ui.Typography>
            <ui.Box variant="soft" columns={"100%"} rows={["25%","65%"]} gap={"5%"} padding={"5%"}>
                <ui.Typography type="h2">Count: {count}</ui.Typography>
                <ui.Button onClick={() => setCount(count + 1)}
                    variant="outlined"
                    color="primary" label="increment"
                />
            </ui.Box>
        </ui.Box>
    );
}

ui.serve(
    () => <App />
)