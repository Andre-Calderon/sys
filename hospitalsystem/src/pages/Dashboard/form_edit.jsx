import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    area_id: "",
    equipo: "",
    fabricante: "",
    modelo: "",
    no_serial: ""
  });
  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Traer áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/areas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.has_error) setAreas(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAreas();
  }, []);

  // 🔹 Traer dispositivo por id
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/dispositivos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener el dispositivo");
        const data = await res.json();

        const deviceData = {
          area_id: data.data.area_id || "",
          equipo: data.data.equipo || "",
          fabricante: data.data.fabricante || "",
          modelo: data.data.modelo || "",
          no_serial: data.data.no_serial || ""
        };
        setFormData(deviceData);
        setOriginalValues(deviceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const body = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalValues[key]) body[key] = formData[key];
      });

      if (Object.keys(body).length === 0) {
        setErrorMsg("No hay cambios para actualizar");
        return;
      }

      const res = await fetch(`${API_URL}/dispositivos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error al actualizar dispositivo");

      setSuccessMsg("Dispositivo actualizado correctamente");

      // redirigir después de 2 segundos
      setTimeout(() => navigate("/registros_equipos"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al actualizar el dispositivo");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center mb-3">
          Editar información del dispositivo
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{
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
            <Grid item xs={12}>
              <TextField
                required
                label="Nombre del equipo"
                name="equipo"
                value={formData.equipo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Área Específica</InputLabel>
                <Select
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  required
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Fabricante"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Número de serie"
                name="no_serial"
                value={formData.no_serial}
                onChange={handleChange}
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

export default Edit_Dashboard;