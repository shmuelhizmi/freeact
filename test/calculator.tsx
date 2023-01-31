import React, { $ } from "@freeact/joy/react";
const { Box, Button, Input } = $.JOY;
const { Favicon } = $.DOM;

const __dirname = new URL(".", import.meta.url).pathname;

function Calculator() {
  const [expression, setExpression] = React.useState("");
  const buttonBaseProps = {
    variant: "solid" as const,
    size: "lg" as const,
  };
  const button = (num: number | string) => {
    return (
      <Button
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
      <Favicon
        type="path"
        absolutePath={__dirname + "/assets/circle.svg"}
      />
      <Box
        columns={"min(100vw, 500px)"}
        rows={["80px", "calc(95% - 80px)"]}
        gap={10}
        padding={"3%"}
      >
        <Input
          onChange={(text) => setExpression(text)}
          value={expression}
          placeholder="expression"
          type="text"
          fontSize={60}
        />
        <Box
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
          <Button
            onClick={() => setExpression("")}
            {...buttonBaseProps}
            color="danger"
            label="clear"
          />
          {button(0)}
          <Button
            onClick={() => calc()}
            {...buttonBaseProps}
            color="success"
            label="="
          />
        </Box>
      </Box>
    </>
  );
}

React.serve(() => <Calculator />, {
  runFrom: "browser",
  title: "Calculator",
  windowDimensions: { width: 550, height: 750 },
});
