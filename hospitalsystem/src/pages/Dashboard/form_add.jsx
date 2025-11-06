import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Add_Dashboard = () => {
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    area_id: "",
    equipo: "",
    fabricante: "",
    modelo: "",
    no_serial: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // 🔹 Traer áreas desde la API
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/areas`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener áreas");

        const result = await response.json();
        if (!result.has_error) {
          setAreas(result.data || []);
        }
      } catch (error) {
        console.error("Error en fetchAreas:", error);
      }
    };

    fetchAreas();
  }, []);

  // 🔹 Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/dispositivos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok && !result.has_error) {
        setSuccessMsg("Dispositivo agregado correctamente 🎉");

        // Reiniciar formulario
        setFormData({
          area_id: "",
          equipo: "",
          fabricante: "",
          modelo: "",
          no_serial: "",
        });

        // Redirigir tras 2 segundos
        setTimeout(() => navigate("/registros_equipos"), 2000);
      } else {
        setErrorMsg(result.message || "Error al guardar el dispositivo");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center mb-3">
          Agregar información del Equipo
        </Typography>

        {/* Alertas de éxito o error */}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          autoComplete="off"
          sx={{
            "& .MuiFormControl-root": { width: "100%" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "var(--color-primary)" },
              "&:hover fieldset": { borderColor: "var(--color-primary)" },
              "&.Mui-focused fieldset": {
                borderColor: "var(--color-secondary)",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--color-secondary)",
            },
          }}
        >
          {/* Equipo */}
          <div className="row mb-3">
            <div className="col-md-12">
              <TextField
                required
                label="Nombre del equipo"
                name="equipo"
                value={formData.equipo}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>

          {/* Ubicación */}
          <Typography variant="h6" gutterBottom>
            Información de Ubicación
          </Typography>
          <Divider className="mb-3" />

          <div className="row mb-3">
            <div className="col-md-6">
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
            </div>
          </div>

          {/* Información del equipo */}
          <Typography variant="h6" gutterBottom>
            Información del Equipo
          </Typography>
          <Divider className="mb-3" />

          <div className="row mb-3">
            <div className="col-md-6">
              <TextField
                required
                label="Fabricante"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div className="col-md-6">
              <TextField
                required
                label="Modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <TextField
                required
                label="Número de serie"
                name="no_serial"
                value={formData.no_serial}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>

          {/* Botón */}
          <div className="text-center mt-4">
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
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Add_Dashboard;