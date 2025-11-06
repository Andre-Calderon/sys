import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Link,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, AccountCircle } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/img/logo.png";
import { API_URL } from "../../config/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas o error en el servidor");
      }

      const data = await response.json();
      console.log("Respuesta login:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      login(data.data);
      navigate("/Inicio");
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      style={{ backgroundSize: "cover" }}
    >
      <Box
        p={4}
        bgcolor="var(--color-background-card)"
        borderRadius={2}
        textAlign="center"
        maxWidth={400}
        width="100%"
        boxShadow={3}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "var(--color-text-primary)" }}>
          <img src={Logo} alt="Logo" style={{ width: 200, marginBottom: 16 }} />
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: "var(--color-text-primary)" }}>
          Acceder
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <TextField
            variant="outlined"
            placeholder="Ingresa tu correo"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: "var(--color-icon)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-primary)" },
                "&:hover fieldset": { borderColor: "var(--color-secondary)" },
                "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
              },
              input: { color: "var(--color-text-primary)" }
            }}
          />

          {/* Password */}
          <TextField
            variant="outlined"
            placeholder="Ingresa tu contraseña"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "var(--color-icon)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff sx={{ color: "var(--color-icon)" }} /> : <Visibility sx={{ color: "var(--color-icon)" }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-primary)" },
                "&:hover fieldset": { borderColor: "var(--color-secondary)" },
                "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
              },
              input: { color: "var(--color-text-primary)" }
            }}
          />

          {/* Reset Password */}
          <Box display="flex" justifyContent="flex-start" mt={1} mb={2}>
            <Link
              href="/reset-password"
              sx={{
                color: "var(--color-primary)",
                textDecoration: "none",
                "&:hover": { color: "var(--color-secondary)" }
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            type="submit"
            sx={{
              mt: 2,
              backgroundColor: "var(--color-primary)"
            }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;