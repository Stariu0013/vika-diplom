import {useState} from "react";

export const useSignUp = ({signUp}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
    });
    const [formError, setFormError] = useState('');

    const validateForm = () => {
        let formErrors = {};
        let isValid = true;

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            formErrors.email = 'Please enter a valid email.';
            isValid = false;
        }

        if (password.length < 6) {
            formErrors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        if (!username.trim()) {
            formErrors.username = 'Username cannot be empty.';
            isValid = false;
        }

        if (password !== confirmPassword) {
            formErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            signUp({ username, email, password })
                .then((res) => {
                    if (res && res.status === 201) {
                        setFormError('');
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setFormError(err.response.data.message || 'Something went wrong. Please try again later.');
                });
        }
    };

    return {
        email,
        password,
        confirmPassword,
        username,
        errors,
        formError,
        setPassword,
        setEmail,
        setConfirmPassword,
        setUsername,
        handleSubmit
    }
};