import { InputProps } from "../../types/ui/input";
import { StyleEnabled, Base } from "./Base";
import { TextField, Textarea, FormLabel } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import React, { useCallback } from "react";

const Input = (props: InputProps & StyleEnabled) => {
    const { className } = props;
    const onChange = useCallback((e: React.ChangeEvent<any>) => {
        props.onChange?.(e.target.value);
    }, [props.onChange]);

    const input = () => {
        if (props.type === 'area') {
            return (
                <Textarea
                    {...props}
                    className={className}
                    onChange={onChange}
                    placeholder={props.label}
                    defaultValue={props.defaultValue}
                />
            );
        }
        return (
            <TextField
                {...props}
                className={className}
                onChange={onChange}
                placeholder={props.label}
                defaultValue={props.defaultValue}
            />
        );
    }
    return (
        <FormControl>
            <FormLabel>{props.label}</FormLabel>
            {input()}
        </FormControl>
    );
};

export default Base(Input);