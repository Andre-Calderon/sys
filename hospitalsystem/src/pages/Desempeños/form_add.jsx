import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { API_URL } from "../../config/api";

const Calificaciones_Agregar = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    ing_id: "",
    puntuacion: "",
    comentario: ""
    // quitamos fecha_creacion
  });

  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Traer lista de ingenieros
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      // Agregar fecha actual automática (ISO string)
      const payload = {
        ...formValues,
        fecha_creacion: new Date().toISOString().split("T")[0] // YYYY-MM-DD
      };

      const response = await fetch(`${API_URL}/calificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && !result.has_error) {
        setSuccessMsg("Calificación registrada exitosamente");
        setFormValues({ ing_id: "", puntuacion: "", comentario: "" });
        setTimeout(() => navigate("/calificaciones"), 2000);
      } else {
        setErrorMsg(result.message || "Error al registrar calificación");
      }
    } catch (error) {
      console.error("Error al registrar calificación:", error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Agregar Calificación
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
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
              {loading ? "Guardando..." : "GUARDAR CALIFICACIÓN"}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Calificaciones_Agregar;