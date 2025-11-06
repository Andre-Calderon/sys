import React, { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

const Agregar_Admin = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    genero: "",
    telefono: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      const response = await fetch(
        `${API_URL}/administradores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formValues,
            genero: formValues.genero === "true",
          }),
        }
      );

      let result;
      try {
        result = await response.json(); // intentar parsear JSON
      } catch {
        throw new Error("Respuesta no válida del servidor");
      }

      if (!response.ok || result.has_error) {
        throw new Error(result?.message || "Error al registrar administrador");
      }

      const generatedPassword = result.data.generated_password;

      // Limpiar formulario
      setFormValues({
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        genero: "",
        telefono: "",
        email: "",
      });

      // Mostrar SweetAlert con la contraseña generada
      Swal.fire({
        title: "Administrador creado exitosamente",
        html: `
          <p><b>Contraseña generada:</b></p>
          <input id="generatedPassword" type="text" value="${generatedPassword}" readonly 
            style="width: 100%; text-align: center; padding: 5px; margin-top: 5px; 
            border: 1px solid #ccc; border-radius: 4px;" />
          <button id="copyBtn" 
            style="margin-top:10px; padding:6px 12px; background:#3085d6; color:#fff; border:none; border-radius:4px; cursor:pointer;">
            Copiar contraseña
          </button>
        `,
        icon: "success",
        confirmButtonText: "Ir a la tabla",
        didOpen: () => {
          const copyBtn = document.getElementById("copyBtn");
          const input = document.getElementById("generatedPassword");
          if (copyBtn && input) {
            copyBtn.addEventListener("click", () => {
              navigator.clipboard.writeText(input.value);
              Swal.showValidationMessage("✅ Contraseña copiada al portapapeles");
              setTimeout(() => Swal.resetValidationMessage(), 2000);
            });
          }
        },
      }).then((resultAlert) => {
        if (resultAlert.isConfirmed) {
          navigate("/registro_administradores");
        }
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Agregar Administrador
        </Typography>

        {errorMsg && (
          <Box mb={2}>
            <Typography color="error">{errorMsg}</Typography>
          </Box>
        )}

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            "& .MuiFormControl-root": { width: "100%" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "var(--color-primary)" },
              "&:hover fieldset": { borderColor: "var(--color-primary)" },
              "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Nombres"
                name="nombres"
                value={formValues.nombres}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Apellido Paterno"
                name="apellido_paterno"
                value={formValues.apellido_paterno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Apellido Materno"
                name="apellido_materno"
                value={formValues.apellido_materno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                select
                SelectProps={{ native: true }}
                label="Género"
                name="genero"
                value={formValues.genero}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="true">Masculino</option>
                <option value="false">Femenino</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Teléfono"
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="email"
                label="Correo electrónico"
                name="email"
                value={formValues.email}
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

export default Agregar_Admin;