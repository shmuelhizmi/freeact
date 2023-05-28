import * as React from "react";
import { useCallback, useEffect } from "react";
import { InputProps } from "../../types/ui/input";
import JoyInput from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import { useDebounce } from "../utils/debounce";
import { Base } from "./Base";
import { StyleEnabled } from "../../types/ui/base";

const Input = (props: InputProps & StyleEnabled) => {
  const [value, setValue] = React.useState(props.value || "");
  const updateRemote = useDebounce(
    (value: string) => {
      props.onChange?.(value);
    },
    350,
    []
  );
  useEffect(() => {
    if (!value.includes(props.value || "") || props.value === "") {
      setValue(props.value || "");
    }
  }, [props.value]);
  const onChange = useCallback(
    (e: React.ChangeEvent<any>) => {
      setValue(e.target.value);
      updateRemote(e.target.value);
    },
    [props.onChange]
  );
  const sx = {
    [`& input, & textarea`]: {
      fontSize: props.fontSize,
      maxWidth: '97%',
    },
  };
  return (
    <FormControl>
      {props.type === "area" ? (
        <Textarea
          onChange={onChange}
          sx={sx}
          value={value}
          placeholder={props.placeholder}
          className={props.className}
        />
      ) : (
        <JoyInput
          onChange={onChange}
          fullWidth
          sx={sx}
          value={value}
          placeholder={props.placeholder}
          className={props.className}
          type={props.type}
        />
      )}
    </FormControl>
  );
};

export default Base(Input);
