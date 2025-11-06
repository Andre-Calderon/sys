import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config/api";

const Add_Atraso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    disp_med_id: "",
    ticket: "",
    ing_id: "",
    fecha_fin: "",
    estado: "pendiente",
    descripcion_problema: "",
  });
  const [mantenimientos, setMantenimientos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [loadingMantenimientos, setLoadingMantenimientos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [equipoNombre, setEquipoNombre] = useState("");
  const [ingenieroNombre, setIngenieroNombre] = useState("");

  // Obtener lista de mantenimientos, dispositivos e ingenieros
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingMantenimientos(false);
      return;
    }

    const fetchMantenimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/mantenimientos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener mantenimientos");

        const data = await res.json();
        if (!data.has_error) {
          setMantenimientos(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchDispositivos = async () => {
      try {
        const res = await fetch(`${API_URL}/dispositivos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener dispositivos");

        const data = await res.json();
        if (!data.has_error) {
          setDispositivos(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchIngenieros = async () => {
      try {
        const res = await fetch(`${API_URL}/ingenieros`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener ingenieros");

        const data = await res.json();
        if (!data.has_error) {
          setIngenieros(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAll = async () => {
      setLoadingMantenimientos(true);
      await Promise.all([fetchMantenimientos(), fetchDispositivos(), fetchIngenieros()]);
      setLoadingMantenimientos(false);
    };

    fetchAll();
  }, []);

  // Si viene desde mantenimientos, prellenar datos
  useEffect(() => {
    if (location.state?.mantenimiento) {
      const mantenimiento = location.state.mantenimiento;
      setFormValues((prev) => ({
        ...prev,
        ticket: mantenimiento.ticket || "",
        disp_med_id: mantenimiento.disp_med_id || "",
        ing_id: mantenimiento.ingeniero?.id || mantenimiento.ing_id || "",
      }));
      
      // Establecer nombres
      if (mantenimiento.dispositivo) {
        setEquipoNombre(mantenimiento.dispositivo.equipo || "");
      } else if (mantenimiento.disp_med_id && dispositivos.length > 0) {
        const dispositivo = dispositivos.find((d) => d.id === mantenimiento.disp_med_id);
        if (dispositivo) {
          setEquipoNombre(dispositivo.equipo || "");
        }
      }
      
      if (mantenimiento.ingeniero) {
        setIngenieroNombre(
          `${mantenimiento.ingeniero.nombres || ""} ${mantenimiento.ingeniero.apellido_paterno || ""} ${mantenimiento.ingeniero.apellido_materno || ""}`.trim()
        );
      } else if (mantenimiento.ingeniero?.id && ingenieros.length > 0) {
        const ingeniero = ingenieros.find((i) => i.id === mantenimiento.ingeniero.id);
        if (ingeniero) {
          setIngenieroNombre(
            `${ingeniero.nombres || ""} ${ingeniero.apellido_paterno || ""} ${ingeniero.apellido_materno || ""}`.trim()
          );
        }
      }
    }
  }, [location.state, dispositivos, ingenieros]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se selecciona un ticket, buscar el mantenimiento y prellenar campos
    if (name === "ticket" && value) {
      const mantenimiento = mantenimientos.find((m) => m.ticket === value || m.ticket?.toString() === value);
      if (mantenimiento) {
        setFormValues((prev) => ({
          ...prev,
          ticket: value,
          disp_med_id: mantenimiento.disp_med_id || "",
          ing_id: mantenimiento.ingeniero?.id || mantenimiento.ing_id || "",
        }));
        
        // Establecer nombres para mostrar
        if (mantenimiento.dispositivo) {
          setEquipoNombre(mantenimiento.dispositivo.equipo || "");
        } else if (mantenimiento.disp_med_id && dispositivos.length > 0) {
          const dispositivo = dispositivos.find((d) => d.id === mantenimiento.disp_med_id);
          setEquipoNombre(dispositivo?.equipo || `ID: ${mantenimiento.disp_med_id}`);
        } else {
          setEquipoNombre(mantenimiento.disp_med_id ? `ID: ${mantenimiento.disp_med_id}` : "");
        }
        
        if (mantenimiento.ingeniero) {
          const nombreCompleto = `${mantenimiento.ingeniero.nombres || ""} ${mantenimiento.ingeniero.apellido_paterno || ""} ${mantenimiento.ingeniero.apellido_materno || ""}`.trim();
          setIngenieroNombre(nombreCompleto || `ID: ${mantenimiento.ingeniero.id}`);
        } else if (mantenimiento.ing_id && ingenieros.length > 0) {
          const ingeniero = ingenieros.find((i) => i.id === mantenimiento.ing_id || i.id === mantenimiento.ingeniero?.id);
          if (ingeniero) {
            const nombreCompleto = `${ingeniero.nombres || ""} ${ingeniero.apellido_paterno || ""} ${ingeniero.apellido_materno || ""}`.trim();
            setIngenieroNombre(nombreCompleto || `ID: ${ingeniero.id}`);
          } else {
            setIngenieroNombre(mantenimiento.ing_id ? `ID: ${mantenimiento.ing_id}` : "");
          }
        } else {
          setIngenieroNombre("");
        }
      } else {
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setEquipoNombre("");
        setIngenieroNombre("");
      }
    } else if (name === "ticket" && !value) {
      // Si se limpia el folio, limpiar también los nombres
      setFormValues((prev) => ({ ...prev, [name]: value, disp_med_id: "", ing_id: "" }));
      setEquipoNombre("");
      setIngenieroNombre("");
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
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

      // Agregar ticket
      if (formValues.ticket) {
        body.ticket = formValues.ticket;
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
          ing_id: "",
          fecha_fin: "",
          estado: "pendiente",
          descripcion_problema: "",
        });
        setEquipoNombre("");
        setIngenieroNombre("");
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
              <FormControl fullWidth required error={!!validationErrors.ticket}>
                <InputLabel id="ticket-label">Folio del Mantenimiento (Ticket)</InputLabel>
                <Select
                  labelId="ticket-label"
                  label="Folio del Mantenimiento (Ticket)"
                  name="ticket"
                  value={formValues.ticket}
                  onChange={handleChange}
                  disabled={loadingMantenimientos}
                  sx={{
                    "&.MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "var(--color-primary)" },
                      "&:hover fieldset": { borderColor: "var(--color-primary)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                  }}
                >
                  <MenuItem value="">
                    <em>Seleccione un folio</em>
                  </MenuItem>
                  {mantenimientos.map((mant) => (
                    <MenuItem key={mant.id} value={mant.ticket || mant.id}>
                      {mant.ticket || mant.id}
                    </MenuItem>
                  ))}
                </Select>
                {(validationErrors.ticket?.[0] || (loadingMantenimientos && "Cargando folios...")) && (
                  <Typography variant="caption" color={validationErrors.ticket ? "error" : "text.secondary"} sx={{ mt: 0.5, ml: 1.75 }}>
                    {validationErrors.ticket?.[0] || "Cargando folios..."}
                  </Typography>
                )}
              </FormControl>
            </div>

            <div className="col-12 col-md-6">
              <TextField
                required
                label="Equipo"
                name="equipo_display"
                value={equipoNombre || ""}
                helperText={validationErrors.disp_med_id?.[0] || "Se completa automáticamente al seleccionar el folio"}
                error={!!validationErrors.disp_med_id}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                required
                label="Ingeniero"
                name="ingeniero_display"
                value={ingenieroNombre || ""}
                helperText={validationErrors.ing_id?.[0] || "Se completa automáticamente al seleccionar el folio"}
                error={!!validationErrors.ing_id}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
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