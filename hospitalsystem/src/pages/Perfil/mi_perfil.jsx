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
  CardContent,
  Divider
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
    pass: "",
    nueva_password: "",
    confirmar_password: ""
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
    // Convertir genero de número a boolean (1 = true, 0 = false)
    let generoValue = "";
    if (data.genero !== null && data.genero !== undefined && data.genero !== "") {
      generoValue = data.genero === 1 || data.genero === true || data.genero === "1";
    }
    
    const userData = {
      nombres: data.nombres || "",
      apellido_paterno: data.apellido_paterno || "",
      apellido_materno: data.apellido_materno || "",
      telefono: data.telefono || "",
      email: data.email || "",
      genero: generoValue,
      pass: "",
      nueva_password: "",
      confirmar_password: ""
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

  // Determinar si el usuario es ingeniero
  const isIngeniero = userType === "ingeniero" || user?.role === "ingeniero";

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

      // Validar que si hay nueva contraseña, ambas estén llenas y coincidan
      if (formValues.nueva_password || formValues.confirmar_password) {
        if (!formValues.nueva_password || !formValues.confirmar_password) {
          setErrorMsg("Debe completar ambos campos de contraseña");
          setSubmitting(false);
          return;
        }
        if (formValues.nueva_password !== formValues.confirmar_password) {
          setErrorMsg("Las contraseñas no coinciden");
          setSubmitting(false);
          return;
        }
      }

      // Si hay nueva contraseña, llamar al endpoint de reset-password
      if (formValues.nueva_password && formValues.confirmar_password) {
        try {
          const resetRes = await fetch(
            `${API_URL}/reset-password`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                email: formValues.email,
                password: formValues.nueva_password,
                password_confirmation: formValues.confirmar_password
              })
            }
          );

          if (!resetRes.ok) {
            const errorData = await resetRes.json();
            throw new Error(errorData.message || "Error al cambiar la contraseña");
          }
        } catch (resetErr) {
          setErrorMsg(resetErr.message || "Error al cambiar la contraseña");
          setSubmitting(false);
          return;
        }
      }

      // Si es ingeniero, solo permitir cambio de contraseña
      if (isIngeniero) {
        // Solo procesar cambio de contraseña si hay valores
        if (!formValues.nueva_password && !formValues.confirmar_password) {
          setErrorMsg("No se pueden realizar cambios en el perfil. Solo se permite cambiar la contraseña.");
          setSubmitting(false);
          return;
        }
        // Si hay contraseña nueva, ya se procesó arriba, solo mostrar éxito
        setSuccessMsg("Contraseña actualizada correctamente");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        setSubmitting(false);
        return;
      }

      // Solo enviar campos modificados (sin incluir las contraseñas)
      const body = {};
      Object.keys(formValues).forEach((key) => {
        // Excluir campos de contraseña del body normal
        if (key !== "nueva_password" && key !== "confirmar_password" && key !== "pass") {
          if (formValues[key] !== originalValues[key]) {
            body[key] = formValues[key];
          }
        }
      });

      // Asegurar tipo correcto para genero (1 = true/masculino, 0 = false/femenino)
      if ("genero" in body) {
        // Convertir a número: true -> 1, false -> 0
        body.genero = body.genero === true || body.genero === "true" || body.genero === 1 ? 1 : 0;
      }

      // Solo hacer PUT si hay cambios en otros campos
      if (Object.keys(body).length > 0) {
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
      } else if (!formValues.nueva_password && !formValues.confirmar_password) {
        // Si no hay cambios y no hay contraseña nueva, mostrar mensaje
        setSuccessMsg("No hay cambios para actualizar");
        setSubmitting(false);
        return;
      } else {
        // Si solo se cambió la contraseña, mostrar éxito
        setSuccessMsg("Perfil actualizado correctamente");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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

  // Determinar si el usuario es ingeniero (para el render)
  const isIngenieroRender = userType === "ingeniero" || user?.role === "ingeniero";

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
              "& .MuiFormControl-root": { 
                width: "100%"
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-primary)" },
                "&:hover fieldset": { borderColor: "var(--color-primary)" },
                "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" }
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" }
            }}
          >
            <Grid container spacing={3}>
              {/* Primera fila: Nombres y Apellido Paterno */}
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
                  InputProps={{
                    readOnly: isIngenieroRender
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      ...(isIngenieroRender && {
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)"
                        }
                      })
                    }
                  }}
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
                  InputProps={{
                    readOnly: isIngenieroRender
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      ...(isIngenieroRender && {
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)"
                        }
                      })
                    }
                  }}
                />
              </Grid>
              {/* Segunda fila: Apellido Materno y Teléfono */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="apellido_materno"
                  value={formValues.apellido_materno}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Apellido Materno"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: isIngenieroRender
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      ...(isIngenieroRender && {
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)"
                        }
                      })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="telefono"
                  value={formValues.telefono}
                  onChange={handleChange}
                  required
                  type="text"
                  label="Número de teléfono"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: isIngenieroRender
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      ...(isIngenieroRender && {
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)"
                        }
                      })
                    }
                  }}
                />
              </Grid>
              {/* Tercera fila: Email y Género */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                  type="email"
                  label="Correo electrónico"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: isIngenieroRender
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      ...(isIngenieroRender && {
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)"
                        }
                      })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                      "& fieldset": {
                        borderColor: "var(--color-primary)"
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-secondary)"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": {
                        color: "var(--color-secondary)"
                      }
                    }
                  }}
                >
                  <InputLabel id="genero-label">Género</InputLabel>
                  <Select
                    labelId="genero-label"
                    name="genero"
                    value={formValues.genero}
                    onChange={handleChange}
                    label="Género"
                    disabled={isIngenieroRender}
                  >
                    <MenuItem value={true}>Masculino</MenuItem>
                    <MenuItem value={false}>Femenino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Separador y sección de contraseñas */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ mb: 3, color: "var(--color-primary)", fontWeight: "bold", textAlign: "center" }}>
                Restablecer contraseña
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="nueva_password"
                    value={formValues.nueva_password}
                    onChange={handleChange}
                    type="password"
                    label="Nueva contraseña"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "56px"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="confirmar_password"
                    value={formValues.confirmar_password}
                    onChange={handleChange}
                    type="password"
                    label="Confirmar nueva contraseña"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "56px"
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

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

