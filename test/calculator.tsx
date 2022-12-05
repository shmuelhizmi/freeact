import React, { useState } from "../server";

function Calculator() {
  const [expression, setExpression] = useState("");
  const button = (num: number | string) => {
    return (
      <React.Button
        onClick={() => setExpression(expression + num)}
        variant="solid"
        size="lg"
        color={typeof num === "number" ? "primary" : "info"}
        label={num.toString()}
      />
    );
  };

  const calc = () => {
    // make sure expression is valid otherwise could lead to security issues
    const valid = expression.match(/^[0-9\+\-\*\/\.]+$/);
    if (!valid) {
      setExpression("0-0");
      return;
    }
    try {
      setExpression(eval(expression).toString());
    } catch (e) {
      setExpression("WTF?");
    }
  };
  return (
    <>
      <React.Favicon
        type="path"
        absolutePath={__dirname + "/assets/circle.svg"}
      />
      <React.Box
        variant="soft"
        columns={"min(100vw, 500px)"}
        rows={["80px", "calc(95% - 80px)"]}
        gap={10}
        padding={"3%"}
      >
        <React.Input
          onChange={(text) => setExpression(text)}
          value={expression}
          placeholder="expression"
          type="text"
          fontSize={60}
        />
        <React.Box
          rows={["25%", "25%", "25%", "25%"]}
          columns={["25%", "25%", "25%", "25%"]}
          gap={"2%"}
          padding={"5%"}
        >
          {button("+")}
          {button(1)}
          {button(2)}
          {button(3)}
          {button("-")}
          {button(4)}
          {button(5)}
          {button(6)}
          {button("/")}
          {button(7)}
          {button(8)}
          {button(9)}
          {button("*")}
          <React.Button
            onClick={() => setExpression("")}
            variant="solid"
            size="lg"
            color="danger"
            label="clear"
          />
          {button(0)}
          <React.Button
            onClick={() => calc()}
            variant="solid"
            size="lg"
            color="success"
            label="="
          />
        </React.Box>
      </React.Box>
    </>
  );
}

React.serve(() => <Calculator />, {
  runFrom: "browser",
  title: "Calculator",
  windowDimensions: { width: 500, height: 750 },
});
