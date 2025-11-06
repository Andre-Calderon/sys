import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_Area = () => {
  const { id } = useParams(); // id del área
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    nombre: "",
    nombre_encargado: ""
  });

  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);

  // GET datos del área
  useEffect(() => {
    const fetchArea = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/areas/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error("Error al obtener el área específica");
        const data = await res.json();

        const areaData = {
          nombre: data.data.nombre || "",
          nombre_encargado: data.data.nombre_encargado || ""
        };

        setFormValues(areaData);
        setOriginalValues(areaData); // guardamos los originales para comparar
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArea();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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
        `${API_URL}/areas/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );
      if (!res.ok) throw new Error("Error al actualizar el área específica");

      navigate("/areas"); // redirige a listado de áreas
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Actualizar información del área específica
        </Typography>

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
              "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" }
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                required
                type="text"
                label="Nombre del área específica"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre_encargado"
                value={formValues.nombre_encargado}
                onChange={handleChange}
                required
                type="text"
                label="Nombre del encargado del área específica"
                variant="outlined"
                fullWidth
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

export default Edit_Area;