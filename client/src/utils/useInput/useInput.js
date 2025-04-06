import {useState} from "react";

export const useInput = (initialValue) => {
    const [value, setValue] = useState(initialValue);

    const onChange = (e) => {
        setValue(e.target ? e.target.value : e);
    };

    return {
        value, onChange
    }
}