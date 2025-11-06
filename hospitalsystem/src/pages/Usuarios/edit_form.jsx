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
  CircularProgress
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
    pass: ""
  });

  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);

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
          pass: "" // no traemos contraseña
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
    try {
      const token = localStorage.getItem("token");

      // solo enviamos campos que cambiaron
      const body = {};
      Object.keys(formValues).forEach((key) => {
        if (formValues[key] !== originalValues[key]) {
          body[key] = formValues[key];
        }
      });

      console.log("Payload enviado al PUT:", body);

      if (Object.keys(body).length === 0) {
        console.log("No hay cambios para actualizar");
        return;
      }

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

      navigate("/registro_ingenieros");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Actualizar información de usuario
        </Typography>

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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={6} style={{ display: "none" }}>
              <TextField
                name="pass"
                value={formValues.pass}
                type="password"
                label="Contraseña"
                variant="outlined"
                fullWidth
                disabled
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
                  "&:hover": { backgroundColor: "var(--color-primary)" }
                }}
              >
                {loading ? (
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