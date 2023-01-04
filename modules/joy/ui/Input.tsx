import React, { useCallback, useEffect } from "react";
import { InputProps } from "../types/ui/input";
import { TextField, Textarea } from "@mui/joy";
import { useDebounce } from '../../utils/debounce'
import { Base } from "./Base";
import { StyleEnabled } from "../types/ui/base";

const Input = (props: InputProps & StyleEnabled) => {
    const [value, setValue] = React.useState(props.value || "");
    const updateRemote = useDebounce((value: string) => {
        props.onChange?.(value)
    }, 350, [])
    useEffect(() => {
        if (!value.includes(props.value || '') || props.value === '') {
            setValue(props.value || '')
        }
    }, [props.value]);
    const onChange = useCallback(
        (e: React.ChangeEvent<any>) => {
            setValue(e.target.value);
            updateRemote(e.target.value)
        },
        [props.onChange]
    );
    const sx = {
        [`& input`]: {
            fontSize: props.fontSize,
        }
    };
    return (
        props.type === "area" ? (
            <Textarea
                onChange={onChange}
                sx={sx}
                value={value}
                placeholder={props.placeholder}
                className={props.className}
            />
        ) : (
            <TextField
                onChange={onChange}
                fullWidth
                sx={sx}
                value={value}
                label={props.label}
                placeholder={props.placeholder}
                className={props.className}
                type={props.type}
            />
        )
    );
};

export default Base(Input);
