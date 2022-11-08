import { InputProps } from "../../types/ui/input";
import { TextField, Textarea, ScopedCssBaseline } from "@mui/joy";
import React, { useCallback, useEffect } from "react";
import { useDebounce } from '../../utils/debounce'

const Input = (props: InputProps) => {
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
            />
        ) : (
            <TextField
                onChange={onChange}
                fullWidth
                sx={sx}
                value={value}
                label={props.label}
                placeholder={props.placeholder}
            />
        )
    );
};

export default Input;
