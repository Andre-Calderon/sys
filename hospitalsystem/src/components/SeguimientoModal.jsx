import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  CircularProgress,
  Box,
  Alert,
  LinearProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { FaTools } from "react-icons/fa";
import { MdComputer, MdWarning, MdCheckCircle } from "react-icons/md";
import { API_URL } from "../config/api";
import "../assets/styles/seguimientos.css";

const SeguimientoModal = ({ open, onClose, mantenimientoId, ticket }) => {
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open && mantenimientoId) {
      fetchSeguimiento();
    }
  }, [open, mantenimientoId]);

  const fetchSeguimiento = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/mantenimientos/seguimiento/listado`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener seguimiento");

      const data = await res.json();
      if (!data.has_error) {
        // Buscar el mantenimiento específico por ID o ticket
        const mantenimiento = (data.data || []).find(
          (item) => item.id === mantenimientoId || item.ticket === ticket
        );
        setSeguimiento(mantenimiento || null);
        if (!mantenimiento) {
          setErrorMsg("No se encontró información de seguimiento para este mantenimiento");
        }
      } else {
        setErrorMsg(data.message || "Error al obtener seguimiento");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const finalDateReached = () => {
    if (!seguimiento) return false;
    const dateKey = seguimiento?.tiene_atraso ? seguimiento?.fecha_fin_atraso : seguimiento?.fecha_fin;
    if (!dateKey) return true;
    const targetDate = new Date(dateKey);
    const today = new Date();
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return targetDate <= today;
  };

  const getEstadoProgreso = () => {
    if (!seguimiento) return "Servicio Generado";

    const estadoProgreso = (seguimiento.estado_progreso || "").toLowerCase();
    const estado = (seguimiento.estado || "").toLowerCase();

    if (estadoProgreso.includes("retras") || estado.includes("retras")) return "Retrasado";
    if (estadoProgreso.includes("final") || estado.includes("final")) return "Finalizado";
    if (
      estadoProgreso.includes("proceso") ||
      estado.includes("proceso") ||
      estado.includes("atención") ||
      estado.includes("atencion")
    ) {
      return "En Atención";
    }

    return "Servicio Generado";
  };

  const getStatusCompleted = (stepStatus) => {
    const estadoProgreso = getEstadoProgreso();
    const dateReached = finalDateReached();

    switch (stepStatus) {
      case "Servicio Generado":
        return estadoProgreso === "Servicio Generado" || 
               estadoProgreso === "En Atención" || 
               estadoProgreso === "Retrasado" || 
               estadoProgreso === "Finalizado";
      case "En Atención":
        return estadoProgreso === "En Atención" || 
               estadoProgreso === "Retrasado" || 
               estadoProgreso === "Finalizado";
      case "Retrasado":
        return estadoProgreso === "Retrasado";
      case "Finalizado":
        return estadoProgreso === "Finalizado" && dateReached;
      default:
        return false;
    }
  };

  const handleClose = () => {
    setSeguimiento(null);
    setErrorMsg("");
    onClose();
  };

  const serviceCompleted = getStatusCompleted("Servicio Generado");
  const attentionCompleted = getStatusCompleted("En Atención");
  const retrasadoCompleted = seguimiento?.tiene_atraso
    ? getStatusCompleted("Retrasado")
    : false;
  const finalCompleted = getStatusCompleted("Finalizado");

  const totalSteps = seguimiento?.tiene_atraso ? 4 : 3;
  const completedSteps =
    Number(serviceCompleted) +
    Number(attentionCompleted) +
    Number(retrasadoCompleted) +
    Number(finalCompleted);

  const progressValue = totalSteps
    ? Math.round((Math.min(completedSteps, totalSteps) / totalSteps) * 100)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "var(--color-primary)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" component="span" sx={{ textTransform: "uppercase", fontWeight: "lighter" }}>
            Seguimiento de Mantenimiento -{" "}
          </Typography>
          <Typography variant="h6" component="span" sx={{ fontWeight: "medium" }}>
            {ticket || seguimiento?.ticket || "N/A"}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando seguimiento...</Typography>
          </Box>
        ) : errorMsg ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMsg}</Alert>
          </Box>
        ) : seguimiento ? (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                bgcolor: "#f5f5f5",
                p: 2,
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: "auto" }, textAlign: "center", py: 1, px: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Tipo de Mantenimiento:
                </Typography>
                <Typography variant="body1">{seguimiento.tipo_servicio || "—"}</Typography>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "auto" }, textAlign: "center", py: 1, px: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Equipo:
                </Typography>
                <Typography variant="body1">
                  {seguimiento.equipo || "—"} - S/N {seguimiento.numero_serial || "—"}
                </Typography>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "auto" }, textAlign: "center", py: 1, px: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Progreso:
                </Typography>
                <Typography variant="body1">{seguimiento.porcentaje_progreso || 0}%</Typography>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box
                className="steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x"
              >
                <div
                  className={`step ${getStatusCompleted("Servicio Generado") ? "completed" : ""}`}
                >
                  <div className="step-icon-wrap">
                    <div className="step-icon">
                      <MdComputer />
                    </div>
                  </div>
                  <h4 className="step-title">Servicio Generado</h4>
                </div>

                <div
                  className={`step ${getStatusCompleted("En Atención") ? "completed" : ""}`}
                >
                  <div className="step-icon-wrap">
                    <div className="step-icon">
                      <FaTools />
                    </div>
                  </div>
                  <h4 className="step-title">En Atención</h4>
                </div>

                {seguimiento.tiene_atraso && (
                  <div
                    className={`step ${getStatusCompleted("Retrasado") ? "completed" : ""} warning-step`}
                  >
                    <div className="step-icon-wrap">
                      <div className="step-icon">
                        <MdWarning />
                      </div>
                    </div>
                    <h4 className="step-title">Retrasado</h4>
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      Motivo: {seguimiento.descripcion || "Sin descripción"}
                    </Typography>
                  </div>
                )}

                <div
                  className={`step ${getStatusCompleted("Finalizado") ? "completed" : ""}`}
                >
                  <div className="step-icon-wrap">
                    <div className="step-icon">
                      <MdCheckCircle />
                    </div>
                  </div>
                  <h4 className="step-title">Finalizado</h4>
                </div>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Progreso General
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  {progressValue}% completado
                </Typography>
              </Box>

              {seguimiento.descripcion && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Descripción:
                  </Typography>
                  <Typography variant="body1">{seguimiento.descripcion}</Typography>
                </Box>
              )}

              {seguimiento.solucion && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Solución:
                  </Typography>
                  <Typography variant="body1">{seguimiento.solucion}</Typography>
                </Box>
              )}
            </Box>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SeguimientoModal;

