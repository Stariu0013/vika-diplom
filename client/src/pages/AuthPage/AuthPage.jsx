import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const AuthForm = ({ auth }) => {
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-in and sign-up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Validation function
    const validateForm = () => {
        let formErrors = {};
        let isValid = true;

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            formErrors.email = 'Please enter a valid email.';
            isValid = false;
        }

        // Password validation
        if (password.length < 6) {
            formErrors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        // Confirm Password validation (only for sign-up)
        if (isSignUp && password !== confirmPassword) {
            formErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            // Proceed with form submission logic (e.g., API call)
            auth();
            console.log('Form submitted successfully');
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} style={{ padding: '20px' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
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
                        {isSignUp && (
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
                        )}
                        <Box mb={2}>
                            <Button variant="contained" color="primary" fullWidth type="submit">
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </Button>
                        </Box>
                    </form>
                    <Typography align="center">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <Button onClick={() => setIsSignUp(!isSignUp)} color="primary">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AuthForm;
