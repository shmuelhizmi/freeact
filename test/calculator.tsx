import React, { useState } from "../modules/joy/server/react";

function Calculator() {
  const [expression, setExpression] = useState("");
  const buttonBaseProps = {
    variant: "solid" as const,
    size: "lg" as const,
  };
  const button = (num: number | string) => {
    return (
      <React.JOY.Button
        onClick={() => setExpression(expression + num)}
        {...buttonBaseProps}
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
      <React.DOM.Favicon
        type="path"
        absolutePath={__dirname + "/assets/circle.svg"}
      />
      <React.JOY.Box
        columns={"min(100vw, 500px)"}
        rows={["80px", "calc(95% - 80px)"]}
        gap={10}
        padding={"3%"}
      >
        <React.JOY.Input
          onChange={(text) => setExpression(text)}
          value={expression}
          placeholder="expression"
          type="text"
          fontSize={60}
        />
        <React.JOY.Box
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
          <React.JOY.Button
            onClick={() => setExpression("")}
            {...buttonBaseProps}
            color="danger"
            label="clear"
          />
          {button(0)}
          <React.JOY.Button
            onClick={() => calc()}
            {...buttonBaseProps}
            color="success"
            label="="
          />
        </React.JOY.Box>
      </React.JOY.Box>
    </>
  );
}

React.serve(() => <Calculator />, {
  runFrom: "browser",
  title: "Calculator",
  windowDimensions: { width: 550, height: 750 },
});
