import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Alert,
  CircularProgress
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;

const Add_Mantenimiento = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // user.user contiene los datos del admin logueado

  const [formValues, setFormValues] = useState({
    admin_id: "",
    ing_id: "",
    disp_med_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Programado",
    tipo_servicio: "Preventivo",
    descripcion: ""
  });

  const [ingenieros, setIngenieros] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Traer ingenieros y dispositivos
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchIngenieros = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ingenieros`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al obtener ingenieros");
        const data = await res.json();
        setIngenieros(data.data || []);
      } catch (err) {
        console.error(err);
        setIngenieros([]);
      }
    };

    const fetchDispositivos = async () => {
      try {
        const res = await fetch(
          `${API_URL}/dispositivos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al obtener dispositivos");
        const data = await res.json();
        setDispositivos(data.data || []);
      } catch (err) {
        console.error(err);
        setDispositivos([]);
      }
    };

    if (user?.user?.id) {
      setFormValues(prev => ({ ...prev, admin_id: user.user.id }));
      fetchIngenieros();
      fetchDispositivos();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]:
        ["ing_id", "disp_med_id"].includes(name)
          ? Number(value)
          : name === "tipo_servicio"
          ? capitalize(value)
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!user?.user?.id) {
      setErrorMsg("No se pudo determinar el ID del administrador. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formValues,
        admin_id: user.user.id, // Garantiza admin logueado
        ing_id: Number(formValues.ing_id),
        disp_med_id: Number(formValues.disp_med_id),
        estado: capitalize(formValues.estado),
        tipo_servicio: capitalize(formValues.tipo_servicio),
      };

      console.log("📤 Payload a enviar:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${API_URL}/mantenimientos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Respuesta no es JSON:", text);
        setErrorMsg("Error: la API no devolvió JSON válido");
        setLoading(false);
        return;
      }

      if (response.ok && !result.has_error) {
        setSuccessMsg("Mantenimiento creado exitosamente");
        setFormValues({
          admin_id: user.user.id,
          ing_id: "",
          disp_med_id: "",
          fecha_inicio: "",
          fecha_fin: "",
          estado: "Programado",
          tipo_servicio: "Preventivo",
          descripcion: ""
        });
        setTimeout(() => navigate("/registros_mantenimientos"), 2000);
      } else {
        setErrorMsg(result.message || "Error al crear mantenimiento");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center">
          Agregar información de mantenimiento
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
          {/* Administrador (solo lectura, muestra ID + nombre) */}
          <div className="row mb-3">
            <div className="col-12">
              <TextField
                label="Administrador (ID - Nombre)"
                variant="outlined"
                value={`${user?.user?.id || ""} - ${user?.user?.nombres || ""} ${user?.user?.apellido_paterno || ""}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="row mb-3">
            <div className="col-12">
              <TextField
                required
                fullWidth
                label="Descripción del servicio"
                variant="outlined"
                name="descripcion"
                value={formValues.descripcion}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Selección de ingeniero y dispositivo */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <FormControl fullWidth required>
                <InputLabel>Ingeniero asignado</InputLabel>
                <Select
                  name="ing_id"
                  value={formValues.ing_id}
                  onChange={handleChange}
                >
                  {ingenieros.map((ing) => (
                    <MenuItem key={ing.id} value={ing.id}>
                      {ing.nombres} {ing.apellido_paterno}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-md-6 mb-3">
              <FormControl fullWidth required>
                <InputLabel>Dispositivo</InputLabel>
                <Select
                  name="disp_med_id"
                  value={formValues.disp_med_id}
                  onChange={handleChange}
                >
                  {dispositivos.map((disp) => (
                    <MenuItem key={disp.id} value={disp.id}>
                      {disp.equipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Fechas */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <TextField
                required
                fullWidth
                label="Fecha de inicio"
                type="date"
                name="fecha_inicio"
                InputLabelProps={{ shrink: true }}
                value={formValues.fecha_inicio}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <TextField
                required
                fullWidth
                label="Fecha de fin"
                type="date"
                name="fecha_fin"
                InputLabelProps={{ shrink: true }}
                value={formValues.fecha_fin}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Tipo de servicio */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <FormControl fullWidth required>
                <InputLabel>Tipo de servicio</InputLabel>
                <Select
                  name="tipo_servicio"
                  value={formValues.tipo_servicio}
                  onChange={handleChange}
                >
                  <MenuItem value="Preventivo">Preventivo</MenuItem>
                  <MenuItem value="Correctivo">Correctivo</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Botón */}
          <div className="row">
            <div className="col-12 text-center">
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
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Add_Mantenimiento;