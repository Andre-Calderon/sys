import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_User = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    email: "",
    genero: "",
    pass: "",
    nueva_password: "",
    confirmar_password: ""
  });

  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // GET datos del ingeniero
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/ingenieros/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error("Error al obtener el ingeniero");
        const data = await res.json();

        // prellenamos el formulario
        const userData = {
          nombres: data.data.nombres || "",
          apellido_paterno: data.data.apellido_paterno || "",
          apellido_materno: data.data.apellido_materno || "",
          telefono: data.data.telefono || "",
          email: data.data.email || "",
          genero: data.data.genero ?? "",
          pass: "", // no traemos contraseña
          nueva_password: "",
          confirmar_password: ""
        };
        setFormValues(userData);
        setOriginalValues(userData); // guardamos los originales para comparar
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // PUT solo con cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setSubmitting(false);
        return;
      }

      // Validar que si hay nueva contraseña, ambas estén llenas y coincidan
      if (formValues.nueva_password || formValues.confirmar_password) {
        if (!formValues.nueva_password || !formValues.confirmar_password) {
          setErrorMsg("Debe completar ambos campos de contraseña");
          setSubmitting(false);
          return;
        }
        if (formValues.nueva_password !== formValues.confirmar_password) {
          setErrorMsg("Las contraseñas no coinciden");
          setSubmitting(false);
          return;
        }
      }

      // Si hay nueva contraseña, llamar al endpoint de reset-password
      if (formValues.nueva_password && formValues.confirmar_password) {
        try {
          const resetRes = await fetch(
            `${API_URL}/reset-password`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                email: formValues.email,
                password: formValues.nueva_password,
                password_confirmation: formValues.confirmar_password
              })
            }
          );

          if (!resetRes.ok) {
            const errorData = await resetRes.json();
            throw new Error(errorData.message || "Error al cambiar la contraseña");
          }
        } catch (resetErr) {
          setErrorMsg(resetErr.message || "Error al cambiar la contraseña");
          setSubmitting(false);
          return;
        }
      }

      // Actualizar datos del usuario (sin incluir las contraseñas)
      const body = {};
      Object.keys(formValues).forEach((key) => {
        // Excluir campos de contraseña del body normal
        if (key !== "nueva_password" && key !== "confirmar_password" && key !== "pass") {
          if (formValues[key] !== originalValues[key]) {
            body[key] = formValues[key];
          }
        }
      });

      // Solo hacer PUT si hay cambios en otros campos
      if (Object.keys(body).length > 0) {
        const res = await fetch(
          `${API_URL}/ingenieros/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
          }
        );
        if (!res.ok) throw new Error("Error al actualizar");
      }

      navigate("/registro_ingenieros");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Actualizar información de usuario
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2, mx: 3 }}>{errorMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          sx={{
            maxWidth: 900,
            margin: "0 auto",
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            "& .MuiFormControl-root": { width: "100%" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "var(--color-primary)" },
              "&:hover fieldset": { borderColor: "var(--color-primary)" },
              "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" }
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombres"
                value={formValues.nombres}
                onChange={handleChange}
                required
                type="text"
                label="Nombres"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="apellido_paterno"
                value={formValues.apellido_paterno}
                onChange={handleChange}
                required
                type="text"
                label="Apellido Paterno"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="apellido_materno"
                value={formValues.apellido_materno}
                onChange={handleChange}
                required
                type="text"
                label="Apellido Materno"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
                required
                type="text"
                label="Número de teléfono"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                value={formValues.email}
                onChange={handleChange}
                required
                type="email"
                label="Correo electrónico"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  name="genero"
                  value={formValues.genero}
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Masculino</MenuItem>
                  <MenuItem value={false}>Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nueva_password"
                value={formValues.nueva_password}
                onChange={handleChange}
                type="password"
                label="Nueva contraseña"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirmar_password"
                value={formValues.confirmar_password}
                onChange={handleChange}
                type="password"
                label="Confirmar nueva contraseña"
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>

            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || submitting}
                sx={{
                  width: "50%",
                  backgroundColor: "var(--color-primary)",
                  "&:hover": { backgroundColor: "var(--color-primary)" }
                }}
              >
                {loading || submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "GUARDAR DATOS"
                )}
              </Button>
            </Box>
        </Box>
      </div>
    </div>
  );
};

export default Edit_User;