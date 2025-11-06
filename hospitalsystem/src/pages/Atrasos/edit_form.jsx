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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_Atraso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    disp_med_id: "",
    ing_id: "",
    fecha_creacion: "",
    prioridad: "",
    estado: "",
    descripcion_problema: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/tickets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Error al obtener ticket");
        const data = await res.json();

        setFormValues({
          disp_med_id: data.data.disp_med_id || "",
          ing_id: data.data.ing_id || "",
          fecha_creacion: data.data.fecha_creacion || "",
          prioridad: data.data.prioridad || "",
          estado: data.data.estado || "",
          descripcion_problema: data.data.descripcion_problema || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/tickets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar ticket");

      navigate("/mantenimientos_atrasados");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Cargando ticket...</p>;

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center mb-3">
          Actualizar información de mantenimiento atrasado
        </Typography>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Typography variant="h6" gutterBottom>
            Información de equipo atrasado
          </Typography>
          <Divider className="mb-3" />

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <TextField
                required
                type="number"
                label="ID del equipo"
                name="disp_med_id"
                value={formValues.disp_med_id}
                onChange={handleChange}
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
              <TextField
                required
                type="number"
                label="ID del ingeniero"
                name="ing_id"
                value={formValues.ing_id}
                onChange={handleChange}
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
              <TextField
                required
                type="date"
                label="Fecha de creación"
                name="fecha_creacion"
                value={formValues.fecha_creacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
                  Prioridad
                </InputLabel>
                <Select
                  name="prioridad"
                  value={formValues.prioridad}
                  onChange={handleChange}
                  label="Prioridad"
                  sx={{
                    "&.MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "var(--color-primary)" },
                      "&:hover fieldset": { borderColor: "var(--color-primary)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                    }
                  }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: "white" } } }}
                >
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Baja">Baja</MenuItem>
                </Select>
              </FormControl>
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

export default Edit_Atraso;