import {useState} from "react";

export const useSignIn = ({signIn}) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [formError, setFormError] = useState('');

    const validateForm = () => {
        let formErrors = {};
        let isValid = true;

        if (!username.trim()) {
            formErrors.username = 'Username cannot be empty.';
            isValid = false;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            formErrors.email = 'Please enter a valid email.';
            isValid = false;
        }

        if (password.length < 6) {
            formErrors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            signIn({ username, email, password })
                .then(() => {
                    setFormError('');
                })
                .catch(err => {
                    setFormError('Invalid email or password');
                    console.log(err);
                });
        }
    };

    return {
        username,
        email,
        password,
        errors,
        formError,
        setPassword,
        setEmail,
        setUsername,
        handleSubmit,
    }
};