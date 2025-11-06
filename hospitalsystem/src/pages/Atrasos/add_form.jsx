import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Add_Atraso = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    disp_med_id: "",
    ing_id: "",
    fecha_creacion: "",
    prioridad: "Alta",
    estado: "pendiente",
    descripcion_problema: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formValues, prioridad: "Alta" }),
        }
      );

      const result = await response.json();

      if (response.ok && !result.has_error) {
        setSuccessMsg(result.message || "Ticket creado exitosamente");

        setFormValues({
          disp_med_id: "",
          ing_id: "",
          fecha_creacion: "",
          prioridad: "Alta",
          estado: "pendiente",
          descripcion_problema: "",
        });

        setTimeout(() => navigate("/mantenimientos_atrasados"), 1500);
      } else {
        setErrorMsg(result.message || "Error al crear el ticket");
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

export default Add_Atraso;