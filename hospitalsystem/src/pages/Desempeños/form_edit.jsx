import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Calificaciones_Editar = () => {
  const { id } = useParams(); // ID de la calificación
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    ing_id: "",
    puntuacion: "",
    comentario: "",
    fecha_creacion: ""
  });

  const [originalValues, setOriginalValues] = useState({});
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Traer ingenieros
  useEffect(() => {
    const fetchIngenieros = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/ingenieros`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener ingenieros");
        const data = await res.json();
        setIngenieros(data.data || []);
      } catch (err) {
        console.error(err);
        setIngenieros([]);
      }
    };
    fetchIngenieros();
  }, []);

  // Traer datos de la calificación
  useEffect(() => {
    const fetchCalificacion = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/calificaciones/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error("Error al obtener la calificación");
        const data = await res.json();

        const calData = {
          ing_id: data.data.ing_id || "",
          puntuacion: data.data.puntuacion || "",
          comentario: data.data.comentario || "",
          fecha_creacion: data.data.fecha_creacion
            ? data.data.fecha_creacion.split("T")[0] // formatear a yyyy-mm-dd
            : ""
        };

        setFormValues(calData);
        setOriginalValues(calData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalificacion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      // construir payload solo con los cambios
      const body = {};
      Object.keys(formValues).forEach((key) => {
        if (formValues[key] !== originalValues[key]) {
          body[key] = formValues[key];
        }
      });

      if (Object.keys(body).length === 0) {
        setErrorMsg("No hay cambios para actualizar");
        setSaving(false);
        return;
      }

      const res = await fetch(
        `${API_URL}/calificaciones/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );

      const result = await res.json();

      if (res.ok && !result.has_error) {
        setSuccessMsg("Calificación actualizada exitosamente");
        setTimeout(() => navigate("/calificaciones"), 2000);
      } else {
        setErrorMsg(result.message || "Error al actualizar la calificación");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Editar Calificación
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

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
            "& .MuiFormControl-root": { width: "100%" }
          }}
        >
          <Grid container spacing={3}>
            {/* Ingeniero */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="ingeniero-label">Ingeniero</InputLabel>
                <Select
                  labelId="ingeniero-label"
                  name="ing_id"
                  value={formValues.ing_id}
                  onChange={handleChange}
                >
                  {ingenieros.map((ing) => (
                    <MenuItem key={ing.id} value={ing.id}>
                      {ing.nombres} {ing.apellido_paterno} {ing.apellido_materno}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Puntuación */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type="number"
                step="0.1"
                label="Puntuación"
                name="puntuacion"
                value={formValues.puntuacion}
                onChange={handleChange}
              />
            </Grid>

            {/* Comentario */}
            <Grid item xs={12}>
              <TextField
                required
                type="text"
                label="Comentario"
                name="comentario"
                value={formValues.comentario}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Fecha creación */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type="date"
                label="Fecha de creación"
                name="fecha_creacion"
                value={formValues.fecha_creacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                width: "50%",
                backgroundColor: "var(--color-primary)",
                "&:hover": { backgroundColor: "var(--color-primary)" }
              }}
            >
              {saving ? "Guardando..." : "GUARDAR CAMBIOS"}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Calificaciones_Editar;