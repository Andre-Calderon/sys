import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const Mi_Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    email: "",
    genero: "",
    pass: ""
  });

  const [originalValues, setOriginalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userType, setUserType] = useState(""); // "administrador" o "ingeniero"
  const [userId, setUserId] = useState(null);

  // Determinar tipo de usuario y cargar datos
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user || !user.user) {
          setErrorMsg("Usuario no autenticado");
          setLoading(false);
          return;
        }

        const userData = user.user;
        const role = user.role || userData.role || "";
        
        // Determinar tipo de usuario y ID
        let endpoint = "";
        let userId = null;

        if (role === "administrador" || userData.id_administrador) {
          userId = userData.id_administrador || userData.id;
          endpoint = `${API_URL}/administradores/${userId}`;
          setUserType("administrador");
        } else if (role === "ingeniero" || userData.id_ingeniero) {
          userId = userData.id_ingeniero || userData.id;
          endpoint = `${API_URL}/ingenieros/${userId}`;
          setUserType("ingeniero");
        } else {
          // Si no hay role, intentar obtener desde el objeto user
          // Asumimos que si tiene id, podemos intentar ambos endpoints
          userId = userData.id;
          
          // Intentar primero como administrador
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/administradores/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data.data) {
                setUserType("administrador");
                endpoint = `${API_URL}/administradores/${userId}`;
                loadUserData(data.data);
                return;
              }
            }
          } catch (e) {
            // No es administrador, intentar como ingeniero
          }
          
          // Intentar como ingeniero
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/ingenieros/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data.data) {
                setUserType("ingeniero");
                endpoint = `${API_URL}/ingenieros/${userId}`;
                loadUserData(data.data);
                return;
              }
            }
          } catch (e) {
            setErrorMsg("No se pudo determinar el tipo de usuario");
            setLoading(false);
            return;
          }
        }

        if (!endpoint) {
          setErrorMsg("No se pudo determinar el tipo de usuario");
          setLoading(false);
          return;
        }

        setUserId(userId);

        // Obtener datos completos del usuario
        const token = localStorage.getItem("token");
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener datos del usuario");

        const data = await res.json();
        loadUserData(data.data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Error al cargar datos del perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const loadUserData = (data) => {
    const userData = {
      nombres: data.nombres || "",
      apellido_paterno: data.apellido_paterno || "",
      apellido_materno: data.apellido_materno || "",
      telefono: data.telefono || "",
      email: data.email || "",
      genero: data.genero ?? "",
      pass: ""
    };
    setFormValues(userData);
    setOriginalValues(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (!userId || !userType) {
        throw new Error("Información de usuario incompleta");
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      // Solo enviar campos modificados
      const body = {};
      Object.keys(formValues).forEach((key) => {
        if (formValues[key] !== originalValues[key]) {
          body[key] = formValues[key];
        }
      });

      // Asegurar tipo boolean para genero
      if ("genero" in body) {
        body.genero = body.genero === true || body.genero === "true";
      }

      // Omitir password vacía
      if (!body.pass || body.pass.trim() === "") {
        delete body.pass;
      }

      if (Object.keys(body).length === 0) {
        setSuccessMsg("No hay cambios para actualizar");
        setSubmitting(false);
        return;
      }

      // Determinar endpoint según tipo de usuario
      const endpoint = userType === "administrador"
        ? `${API_URL}/administradores/${userId}`
        : `${API_URL}/ingenieros/${userId}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }

      const result = await res.json();

      if (!result.has_error) {
        setSuccessMsg("Perfil actualizado correctamente");
        
        // Actualizar datos en el contexto si es necesario
        // Recargar datos después de actualizar
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMsg(result.message || "No se pudo actualizar el perfil");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="right-content">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    <div className="right-content">
      <Card sx={{ borderRadius: 4, boxShadow: 5, overflow: "hidden" }}>
        <CardContent sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom className="text-center mb-4" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
            Mi Perfil
          </Typography>

          {successMsg && (
            <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            sx={{
              maxWidth: 900,
              margin: "0 auto",
              padding: 2,
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
              <Grid item xs={12} sm={6}>
                <TextField
                  name="nombres"
                  value={formValues.nombres}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Nombres"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="apellido_paterno"
                  value={formValues.apellido_paterno}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Apellido Paterno"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="apellido_materno"
                  value={formValues.apellido_materno}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Apellido Materno"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="telefono"
                  value={formValues.telefono}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Número de teléfono"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                  type="email"
                  label="Correo electrónico"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="genero-label">Género</InputLabel>
                  <Select
                    labelId="genero-label"
                    name="genero"
                    value={formValues.genero}
                    onChange={handleChange}
                    label="Género"
                  >
                    <MenuItem value={true}>Masculino</MenuItem>
                    <MenuItem value={false}>Femenino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="pass"
                  value={formValues.pass}
                  onChange={handleChange}
                  type="password"
                  label="Nueva contraseña (opcional)"
                  variant="outlined"
                  fullWidth
                  helperText="Deja este campo vacío si no deseas cambiar la contraseña"
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" gap={2} mt={3}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  width: "30%",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                  "&:hover": { 
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(0, 0, 0, 0.04)"
                  }
                }}
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  width: "30%",
                  backgroundColor: "var(--color-primary)",
                  "&:hover": { backgroundColor: "var(--color-primary)" }
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "GUARDAR CAMBIOS"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default Mi_Perfil;

