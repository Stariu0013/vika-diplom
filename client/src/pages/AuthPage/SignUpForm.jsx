import { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const SignUpForm = ({ signUp }) => {
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

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ height: 'calc(100vh - 50px)' }}>
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} style={{ padding: '20px' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Sign Up
                    </Typography>
                    {formError && (
                        <Typography color="error" variant="body2" align="center" gutterBottom>
                            {formError}
                        </Typography>
                    )}
                    <form onSubmit={handleSubmit}>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                error={!!errors.username}
                                helperText={errors.username}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Password"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                variant="outlined"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <Button variant="contained" color="primary" fullWidth type="submit">
                                Sign Up
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SignUpForm;
