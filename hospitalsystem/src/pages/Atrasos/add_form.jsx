import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config/api";

const Add_Atraso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    disp_med_id: "",
    ticket: "",
    mantenimiento_id: "",
    ing_id: "",
    fecha_fin: "",
    estado: "pendiente",
    descripcion_problema: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Si viene desde mantenimientos, prellenar datos
  useEffect(() => {
    if (location.state?.mantenimiento) {
      const mantenimiento = location.state.mantenimiento;
      setFormValues((prev) => ({
        ...prev,
        ticket: mantenimiento.ticket || "",
        mantenimiento_id: mantenimiento.id || "",
        disp_med_id: mantenimiento.disp_med_id || "",
        ing_id: mantenimiento.ingeniero?.id || "",
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    setValidationErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      // Preparar el body según la documentación
      // Solo enviar ticket o mantenimiento_id, no ambos
      const body = {
        disp_med_id: formValues.disp_med_id,
        ing_id: formValues.ing_id,
        fecha_fin: formValues.fecha_fin,
        estado: formValues.estado || "pendiente",
        descripcion_problema: formValues.descripcion_problema,
      };

      // Agregar ticket o mantenimiento_id (prioridad a ticket si ambos están)
      if (formValues.ticket) {
        body.ticket = formValues.ticket;
      } else if (formValues.mantenimiento_id) {
        body.mantenimiento_id = formValues.mantenimiento_id;
      }

      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok && !result.has_error) {
        setSuccessMsg(result.message || "Ticket creado exitosamente");

        setFormValues({
          disp_med_id: "",
          ticket: "",
          mantenimiento_id: "",
          ing_id: "",
          fecha_fin: "",
          estado: "pendiente",
          descripcion_problema: "",
        });
        setValidationErrors({});

        setTimeout(() => navigate("/mantenimientos_atrasados"), 1500);
      } else {
        // Manejar errores de validación
        if (result.errors) {
          setValidationErrors(result.errors);
          const errorMessages = Object.values(result.errors)
            .flat()
            .join(", ");
          setErrorMsg(errorMessages);
        } else {
          setErrorMsg(result.message || "Error al crear el ticket");
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center mb-3">
          Agregar información de mantenimiento atrasado
        </Typography>

        {successMsg && <Alert severity="success" className="mb-3">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" className="mb-3">{errorMsg}</Alert>}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Typography variant="h6" gutterBottom>
            Información de equipo atrasado
          </Typography>
          <Divider className="mb-3" />

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <TextField
                required
                type="text"
                label="Folio del Mantenimiento (Ticket)"
                name="ticket"
                value={formValues.ticket}
                onChange={handleChange}
                helperText={validationErrors.ticket?.[0] || "Ingrese el folio del mantenimiento"}
                error={!!validationErrors.ticket}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                type="number"
                label="ID del Mantenimiento (Opcional)"
                name="mantenimiento_id"
                value={formValues.mantenimiento_id}
                onChange={handleChange}
                helperText="Solo si no tiene el folio"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                required
                type="number"
                label="ID del equipo"
                name="disp_med_id"
                value={formValues.disp_med_id}
                onChange={handleChange}
                helperText={validationErrors.disp_med_id?.[0]}
                error={!!validationErrors.disp_med_id}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                required
                type="number"
                label="ID del ingeniero"
                name="ing_id"
                value={formValues.ing_id}
                onChange={handleChange}
                helperText={validationErrors.ing_id?.[0]}
                error={!!validationErrors.ing_id}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                required
                type="date"
                label="Nueva Fecha de Finalización"
                name="fecha_fin"
                value={formValues.fecha_fin}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText={validationErrors.fecha_fin?.[0] || "Debe ser posterior a la fecha original del mantenimiento"}
                error={!!validationErrors.fecha_fin}
                inputProps={{
                  min: new Date().toISOString().split('T')[0] // Mínimo hoy
                }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12">
              <TextField
                required
                multiline
                rows={4}
                label="Motivo o justificación del atraso"
                name="descripcion_problema"
                value={formValues.descripcion_problema}
                onChange={handleChange}
                helperText={validationErrors.descripcion_problema?.[0]}
                error={!!validationErrors.descripcion_problema}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>
          </div>

          <div className="">
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
        </form>
      </div>
    </div>
  );
};

export default Add_Atraso;