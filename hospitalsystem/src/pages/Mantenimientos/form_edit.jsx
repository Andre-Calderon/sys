import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;

// Funciones de mapeo para estado
const mapEstadoFromAPI = (estado) => {
  if (!estado) return "Programado";
  const e = estado.toLowerCase();
  if (e.includes("proceso")) return "En Proceso";
  if (e.includes("final")) return "Finalizado";
  return "Programado";
};

const mapEstadoToAPI = (estado) => {
  const normalized = (estado || "").toLowerCase();
  if (normalized.includes("proceso")) return "En proceso";
  if (normalized.includes("final")) return "Finalizado";
  return "Programado";
};

// Funciones de mapeo para tipo_servicio
const mapServicioFromAPI = (tipo) => {
  if (!tipo) return "Preventivo";
  const t = tipo.toLowerCase();
  if (t.includes("cor")) return "Correctivo";
  return "Preventivo";
};

const mapServicioToAPI = (tipo) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("cor")) return "Correctivo";
  return "Preventivo";
};

const Edit_Mantenimiento = () => {
  const { id } = useParams(); // id del mantenimiento a editar
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    admin_id: "",
    ing_id: "",
    disp_med_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Programado",
    tipo_servicio: "Preventivo",
    descripcion: "",
    solucion: "",
  });

  const [ingenieros, setIngenieros] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fetching, setFetching] = useState(true);

  // GET mantenimiento + ingenieros + dispositivos
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchIngenieros = async () => {
      try {
        const res = await fetch(`${API_URL}/ingenieros`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        const res = await fetch(`${API_URL}/dispositivos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener dispositivos");
        const data = await res.json();
        setDispositivos(data.data || []);
      } catch (err) {
        console.error(err);
        setDispositivos([]);
      }
    };

    const fetchMantenimiento = async () => {
      try {
        const res = await fetch(`${API_URL}/mantenimientos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener mantenimiento");
        const data = await res.json();
        const mantenimiento = data.data;

        setFormValues({
          admin_id: mantenimiento.admin_id || user?.user?.id || "",
          ing_id: mantenimiento.ing_id || "",
          disp_med_id: mantenimiento.disp_med_id || "",
          fecha_inicio: mantenimiento.fecha_inicio?.split("T")[0] || "",
          fecha_fin: mantenimiento.fecha_fin?.split("T")[0] || "",
          estado: mapEstadoFromAPI(mantenimiento.estado),
          tipo_servicio: mapServicioFromAPI(mantenimiento.tipo_servicio),
          descripcion: mantenimiento.descripcion || "",
          solucion: mantenimiento.solucion || "",
        });
      } catch (err) {
        console.error(err);
        setErrorMsg("No se pudo obtener el mantenimiento");
      } finally {
        setFetching(false);
      }
    };

    if (user?.user?.id) {
      fetchIngenieros();
      fetchDispositivos();
      fetchMantenimiento();
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]:
        ["ing_id", "disp_med_id"].includes(name)
          ? Number(value)
          : name === "tipo_servicio"
          ? capitalize(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formValues,
        admin_id: user.user.id, // forzamos el admin logueado
        ing_id: Number(formValues.ing_id),
        disp_med_id: Number(formValues.disp_med_id),
        estado: mapEstadoToAPI(formValues.estado),
        tipo_servicio: mapServicioToAPI(formValues.tipo_servicio),
      };

      console.log("📤 Payload a enviar:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${API_URL}/mantenimientos/${id}`,
        {
          method: "PUT",
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
        setSuccessMsg("Mantenimiento actualizado exitosamente");
        setTimeout(() => navigate("/registros_mantenimientos"), 2000);
      } else {
        setErrorMsg(result.message || "Error al actualizar mantenimiento");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="text-center mt-4">Cargando datos...</p>;

  return (
    <div className="right-content">
      <div className="card p-4">
        <Typography variant="h5" gutterBottom className="text-center">
          Actualizar información de mantenimiento
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
              "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
          }}
        >
          <div>
          {user?.role === "administrador" && (
            <>
            {/* Administrador (solo lectura) */}
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

            {/* Ingeniero y dispositivo */}
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

            {/* Estado */}
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <FormControl fullWidth required>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={formValues.estado}
                    onChange={handleChange}
                  >
                    <MenuItem value="Programado">Programado</MenuItem>
                    <MenuItem value="En Proceso">En proceso</MenuItem>
                    <MenuItem value="Finalizado">Finalizado</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            </>
          )}
          </div>

          {/* Solución */}
          <div className="row mb-3">
            <div className="col-12">
              <TextField
                required
                fullWidth
                label="Describe la solución aplicada"
                variant="outlined"
                name="solucion"
                value={formValues.solucion}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Botón */}
          <div className="row">
            <div className="col-12 text-center">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  width: "50%",
                  backgroundColor: "var(--color-primary)",
                  "&:hover": { backgroundColor: "var(--color-primary)" },
                }}
              >
                {loading ? "Guardando..." : "GUARDAR INFORMACIÓN"}
              </Button>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Edit_Mantenimiento;