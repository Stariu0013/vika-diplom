import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';
import {useSignUp} from "./useSignUp.jsx";

const SignUpForm = ({ signUp }) => {
    const {
        confirmPassword,
        email,
        password,
        setPassword,
        formError,
        errors,
        setConfirmPassword,
        setEmail,
        username,
        setUsername,
        handleSubmit
    } = useSignUp({signUp});

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
