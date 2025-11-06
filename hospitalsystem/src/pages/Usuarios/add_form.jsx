import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Grid, Typography, Box, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

const Add_Users = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    genero: true,
    telefono: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/ingenieros`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        }
      );

      const result = await response.json();

      if (response.ok && !result.has_error) {
        const generatedPassword = result.data.generated_password;

        // Limpiar formulario
        setFormValues({
          nombres: "",
          apellido_paterno: "",
          apellido_materno: "",
          genero: true,
          telefono: "",
          email: "",
        });

        // Mostrar SweetAlert con la contraseña
        Swal.fire({
          title: "Ingeniero creado exitosamente",
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
            // Programar botón de copiar
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
            navigate("/registro_ingenieros");
          }
        });
      } else {
        setErrorMsg(result.message || "Error al crear el ingeniero");
      }
    } catch (error) {
      console.error("Error al crear ingeniero:", error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Agregar nuevo ingeniero
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
              "&.Mui-focused fieldset": {
                borderColor: "var(--color-secondary)",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--color-secondary)",
            },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type="text"
                label="Nombres"
                name="nombres"
                value={formValues.nombres}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type="text"
                label="Apellido Paterno"
                name="apellido_paterno"
                value={formValues.apellido_paterno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="text"
                label="Apellido Materno"
                name="apellido_materno"
                value={formValues.apellido_materno}
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
            <Grid item xs={12} sm={4}>
              <TextField
                required
                type="text"
                label="Número de teléfono"
                name="telefono"
                value={formValues.telefono}
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

export default Add_Users;