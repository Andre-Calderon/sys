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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_Atraso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    disp_med_id: "",
    ticket: "",
    ing_id: "",
    fecha_fin: "",
    estado: "",
    descripcion_problema: "",
  });
  const [mantenimientos, setMantenimientos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [equipoNombre, setEquipoNombre] = useState("");
  const [ingenieroNombre, setIngenieroNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Obtener lista de mantenimientos, dispositivos e ingenieros
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
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

    const fetchTicket = async (dispositivosData, ingenierosData) => {
      try {
        const res = await fetch(`${API_URL}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener ticket");
        const data = await res.json();

        const ticketData = data.data;
        setFormValues({
          disp_med_id: ticketData.disp_med_id || "",
          ticket: ticketData.folio_mantenimiento || ticketData.ticket || "",
          ing_id: ticketData.ing_id || "",
          fecha_fin: ticketData.fecha_fin || ticketData.fecha_creacion || "",
          estado: ticketData.estado || "",
          descripcion_problema: ticketData.descripcion_problema || "",
        });

        // Establecer nombres después de cargar los datos
        if (ticketData.disp_med_id && dispositivosData && dispositivosData.length > 0) {
          const dispositivo = dispositivosData.find((d) => d.id === ticketData.disp_med_id);
          if (dispositivo) {
            setEquipoNombre(dispositivo.equipo || "");
          } else {
            setEquipoNombre(`ID: ${ticketData.disp_med_id}`);
          }
        } else if (ticketData.disp_med_id) {
          setEquipoNombre(`ID: ${ticketData.disp_med_id}`);
        }
        
        if (ticketData.ing_id && ingenierosData && ingenierosData.length > 0) {
          const ingeniero = ingenierosData.find((i) => i.id === ticketData.ing_id);
          if (ingeniero) {
            setIngenieroNombre(
              `${ingeniero.nombres || ""} ${ingeniero.apellido_paterno || ""} ${ingeniero.apellido_materno || ""}`.trim()
            );
          } else {
            setIngenieroNombre(`ID: ${ticketData.ing_id}`);
          }
        } else if (ticketData.ing_id) {
          setIngenieroNombre(`ID: ${ticketData.ing_id}`);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar el ticket");
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      // Cargar mantenimientos, dispositivos e ingenieros
      await Promise.all([fetchMantenimientos(), fetchDispositivos(), fetchIngenieros()]);
      
      // Obtener dispositivos e ingenieros directamente de las APIs
      let dispositivosData = [];
      let ingenierosData = [];
      
      try {
        const dispRes = await fetch(`${API_URL}/dispositivos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dispRes.ok) {
          const dispData = await dispRes.json();
          if (!dispData.has_error) {
            dispositivosData = dispData.data || [];
          }
        }
      } catch (err) {
        console.error("Error al obtener dispositivos:", err);
      }
      
      try {
        const ingRes = await fetch(`${API_URL}/ingenieros`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ingRes.ok) {
          const ingData = await ingRes.json();
          if (!ingData.has_error) {
            ingenierosData = ingData.data || [];
          }
        }
      } catch (err) {
        console.error("Error al obtener ingenieros:", err);
      }
      
      // Después de cargar todo, obtener el ticket
      await fetchTicket(dispositivosData, ingenierosData);
    };

    fetchAll();
  }, [id]);

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
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrorMsg("");
    setValidationErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoadingSubmit(false);
        return;
      }

      // Preparar el body según la documentación
      const body = {
        disp_med_id: formValues.disp_med_id,
        ing_id: formValues.ing_id,
        fecha_fin: formValues.fecha_fin,
        estado: formValues.estado || "pendiente",
        descripcion_problema: formValues.descripcion_problema,
      };

      // Agregar ticket si está presente
      if (formValues.ticket) {
        body.ticket = formValues.ticket;
      }

      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...body, prioridad: "Alta" }),
      });

      const result = await res.json();

      if (res.ok && !result.has_error) {
        navigate("/mantenimientos_atrasados");
      } else {
        // Manejar errores de validación
        if (result.errors) {
          setValidationErrors(result.errors);
          const errorMessages = Object.values(result.errors)
            .flat()
            .join(", ");
          setErrorMsg(errorMessages);
        } else {
          setErrorMsg(result.message || "Error al actualizar el ticket");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="right-content">
        <div className="card p-4">
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando ticket...</Typography>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center mb-3">
          Actualizar información de mantenimiento atrasado
        </Typography>

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
                {validationErrors.ticket?.[0] && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {validationErrors.ticket[0]}
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

            <div className="col-12 col-md-4">
              <FormControl fullWidth>
                <InputLabel sx={{ "&.Mui-focused": { color: "var(--color-secondary)" } }}>
                  Estado
                </InputLabel>
                <Select
                  name="estado"
                  value={formValues.estado}
                  onChange={handleChange}
                  label="Estado"
                  sx={{
                    "&.MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "var(--color-primary)" },
                      "&:hover fieldset": { borderColor: "var(--color-primary)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                    }
                  }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: "white" } } }}
                >
                  <MenuItem value="Abierto">Abierto</MenuItem>
                  <MenuItem value="Cerrado">Cerrado</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                </Select>
              </FormControl>
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
                disabled={loadingSubmit}
                sx={{
                  width: "50%",
                  backgroundColor: "var(--color-primary)",
                  "&:hover": { backgroundColor: "var(--color-primary)" }
                }}
              >
                {loadingSubmit ? (
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

export default Edit_Atraso;