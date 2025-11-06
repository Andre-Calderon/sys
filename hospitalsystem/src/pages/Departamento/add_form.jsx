import React, { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Add_Departamento = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(
        `${API_URL}/departamentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error POST departamento:", text);
        throw new Error("Error al crear departamento");
      }

      const result = await res.json();

      if (!result.has_error) {
        setSuccessMsg("Departamento creado correctamente");
        setNombre(""); // limpiar formulario

        // Redirigir después de 2 segundos
        setTimeout(() => navigate("/departamentos"), 2000);
      } else {
        setErrorMsg(result.message || "No se pudo registrar");
      }
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Agregar información del departamento
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            "& .MuiFormControl-root": { width: "100%" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "var(--color-primary)" },
              "&:hover fieldset": { borderColor: "var(--color-primary)" },
              "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type="text"
                label="Nombre del departamento"
                variant="outlined"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                width: "50%",
                backgroundColor: "var(--color-primary)",
                "&:hover": { backgroundColor: "var(--color-primary)" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "GUARDAR DATOS"}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Add_Departamento;
