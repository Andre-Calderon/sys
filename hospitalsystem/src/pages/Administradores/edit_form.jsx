import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Editar_Admin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    genero: "",
    telefono: "",
    email: "",
    pass: "", // opcional si el admin cambia su password
  });

  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // GET por ID
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/administradores/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al obtener administrador");

        const data = await res.json();

        const adminData = {
          nombres: data.data.nombres || "",
          apellido_paterno: data.data.apellido_paterno || "",
          apellido_materno: data.data.apellido_materno || "",
          genero: data.data.genero ?? "",
          telefono: data.data.telefono || "",
          email: data.data.email || "",
          pass: "",
        };

        setFormValues(adminData);
        setOriginalValues(adminData);
      } catch (err) {
        setErrorMsg(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      // Solo enviar campos modificados
      const body = {};
      Object.keys(formValues).forEach((key) => {
        if (formValues[key] !== originalValues[key]) {
          body[key] = formValues[key];
        }
      });

      // Asegurar tipo boolean para genero
      if ("genero" in body) {
        body.genero = body.genero === true || body.genero === "true";
      }

      // Omitir password vacía
      if (!body.pass) delete body.pass;

      if (Object.keys(body).length === 0) {
        setSuccessMsg("No hay cambios para actualizar");
        setSubmitting(false);
        return;
      }

      const res = await fetch(
        `${API_URL}/administradores/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar administrador");

      const result = await res.json();

      if (!result.has_error) {
        setSuccessMsg("Administrador actualizado correctamente");
        setTimeout(() => navigate("/registro_administradores"), 2000);
      } else {
        setErrorMsg(result.message || "No se pudo actualizar");
      }
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Editar Administrador
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
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Nombres"
                name="nombres"
                value={formValues.nombres}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Apellido Paterno"
                name="apellido_paterno"
                value={formValues.apellido_paterno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Apellido Materno"
                name="apellido_materno"
                value={formValues.apellido_materno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Teléfono"
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="email"
                label="Correo electrónico"
                name="email"
                value={formValues.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Contraseña (opcional)"
                name="pass"
                type="password"
                value={formValues.pass}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                width: "50%",
                backgroundColor: "var(--color-primary)",
                "&:hover": { backgroundColor: "var(--color-primary)" },
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "GUARDAR DATOS"}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Editar_Admin;