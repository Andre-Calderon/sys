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
  FormControl,
  CircularProgress
} from "@mui/material";
import { API_URL } from "../../config/api";

const Add_Area = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    departamento_id: "",
    nombre: "",
    nombre_encargado: ""
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Traer departamentos
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/departamentos`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error("Error al obtener departamentos");
        const data = await res.json();
        setDepartamentos(data.data || []); // <-- aseguramos que sea array
      } catch (err) {
        console.error(err);
        setDepartamentos([]);
      }
    };
    fetchDepartamentos();
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

      const response = await fetch(
        `${API_URL}/areas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        }
      );

      const result = await response.json();

      if (response.ok && !result.has_error) {
        setSuccessMsg("Área específica creada exitosamente");
        setFormValues({ departamento_id: "", nombre: "", nombre_encargado: "" });
        setTimeout(() => navigate("/areas"), 2000);
      } else {
        setErrorMsg(result.message || "Error al crear el área específica");
      }
    } catch (error) {
      console.error("Error al crear área:", error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Agregar información del área específica
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="departamento-label"></InputLabel>
                <Select
                  labelId="departamento-label"
                  name="departamento_id"
                  value={formValues.departamento_id}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Seleccione un departamento</em>
                  </MenuItem>
                  {departamentos.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="text"
                label="Nombre del área específica"
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="text"
                label="Nombre del encargado del área específica"
                name="nombre_encargado"
                value={formValues.nombre_encargado}
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

export default Add_Area;