import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const Edit_Departamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    nombre: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [originalValues, setOriginalValues] = useState({});

  // GET departamento por ID
  useEffect(() => {
    const fetchDepartamento = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuario no autenticado");

        const res = await fetch(
          `${API_URL}/departamentos/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Error al obtener departamento");

        const data = await res.json();
        setFormValues({
          nombre: data.data.nombre || "",
        });
        setOriginalValues({
          nombre: data.data.nombre || "",
        });
      } catch (err) {
        setErrorMsg(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartamento();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // PUT para actualizar solo los campos modificados
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      const body = {};
      Object.keys(formValues).forEach((key) => {
        if (formValues[key] !== originalValues[key]) {
          body[key] = formValues[key];
        }
      });

      if (Object.keys(body).length === 0) {
        setErrorMsg("No hay cambios para actualizar");
        setSubmitting(false);
        return;
      }

      const res = await fetch(
        `${API_URL}/departamentos/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar departamento");

      const result = await res.json();
      if (!result.has_error) {
        setSuccessMsg("Departamento actualizado correctamente");
        setTimeout(() => navigate("/departamentos"), 2000);
      } else {
        setErrorMsg(result.message || "No se pudo actualizar");
      }
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Cargando departamento...</Typography>;

  return (
    <div className="right-content">
      <div className="card">
        <Typography variant="h5" gutterBottom className="p-3 text-center">
          Editar Departamento
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
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
          <Box display="flex" justifyContent="center">
            <TextField
              required
              type="text"
              label="Nombre del departamento"
              name="nombre"
              value={formValues.nombre}
              onChange={handleChange}
              sx={{ width: "50%" }}
            />
          </Box>

          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                width: "50%",
                backgroundColor: "var(--color-primary)",
                "&:hover": { backgroundColor: "var(--color-primary)" },
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "GUARDAR DATOS"}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Edit_Departamento;