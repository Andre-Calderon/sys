import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Chip,
  LinearProgress,
  Box,
  Alert,
} from "@mui/material";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const Seguimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const itemsPerPage = 10;
  const { user } = useAuth();

  // Obtener seguimiento de mantenimientos
  const fetchSeguimientos = async () => {
    setLoading(true);
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

      if (!res.ok) throw new Error("Error al obtener seguimientos");

      const data = await res.json();
      if (!data.has_error) {
        setMantenimientos(data.data || []);
      } else {
        setErrorMsg(data.message || "Error al obtener seguimientos");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeguimientos();
  }, []);

  const handleSearch = (text) => setSearchTerm(text);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // Filtrar por búsqueda
  const searchFiltered = mantenimientos.filter((item) => {
    const term = searchTerm.toLowerCase();

    const ticketMatch = item.ticket?.toString().toLowerCase().includes(term);
    const tipoMatch = item.tipo_servicio?.toLowerCase().includes(term);
    const estadoMatch = item.estado?.toLowerCase().includes(term);
    const descripcionMatch = item.descripcion?.toLowerCase().includes(term);
    const equipoMatch = item.equipo?.toLowerCase().includes(term);
    const serialMatch = item.numero_serial?.toLowerCase().includes(term);
    const fabricanteMatch = item.fabricante?.toLowerCase().includes(term);
    const modeloMatch = item.modelo?.toLowerCase().includes(term);
    const estadoProgresoMatch = item.estado_progreso?.toLowerCase().includes(term);

    return (
      ticketMatch ||
      tipoMatch ||
      estadoMatch ||
      descripcionMatch ||
      equipoMatch ||
      serialMatch ||
      fabricanteMatch ||
      modeloMatch ||
      estadoProgresoMatch
    );
  });

  // Filtrar filas según rol
  const roleFiltered = searchFiltered.filter((item) => {
    // Aquí puedes agregar lógica de filtrado por rol si es necesario
    return true; // Por ahora muestra todo
  });

  // Datos filtrados finales
  const filteredData = roleFiltered;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "default";
      case "en_proceso":
      case "en proceso":
        return "primary";
      case "finalizado":
        return "success";
      case "cancelado":
        return "error";
      default:
        return "default";
    }
  };

  const getEstadoProgresoColor = (estado) => {
    switch (estado) {
      case "Retrasado":
        return "warning";
      case "En Proceso":
        return "info";
      case "Finalizado":
        return "success";
      default:
        return "default";
    }
  };

  const normalizeString = (value) => (value || "").toLowerCase();

  const getEstadoProgreso = (item) => {
    const estadoProgreso = normalizeString(item.estado_progreso);
    const estado = normalizeString(item.estado);

    // Si el estado es "Programado", el seguimiento debe ser "Servicio Generado"
    if (estado.includes("programado")) return "Servicio Generado";

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

  const finalDateReached = (item) => {
    const dateKey = item?.tiene_atraso ? item?.fecha_fin_atraso : item?.fecha_fin;
    if (!dateKey) return true;
    const targetDate = new Date(dateKey);
    const today = new Date();
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return targetDate <= today;
  };

  const getStatusCompleted = (item, stepStatus) => {
    const estadoProgreso = getEstadoProgreso(item);
    const dateReached = finalDateReached(item);

    switch (stepStatus) {
      case "Servicio Generado":
        return (
          estadoProgreso === "Servicio Generado" ||
          estadoProgreso === "En Atención" ||
          estadoProgreso === "Retrasado" ||
          estadoProgreso === "Finalizado"
        );
      case "En Atención":
        return (
          estadoProgreso === "En Atención" ||
          estadoProgreso === "Retrasado" ||
          estadoProgreso === "Finalizado"
        );
      case "Retrasado":
        return estadoProgreso === "Retrasado";
      case "Finalizado":
        return estadoProgreso === "Finalizado" && dateReached;
      default:
        return false;
    }
  };

  const getProgressValue = (item) => {
    const serviceCompleted = getStatusCompleted(item, "Servicio Generado") ? 1 : 0;
    const attentionCompleted = getStatusCompleted(item, "En Atención") ? 1 : 0;
    const retrasadoCompleted =
      item?.tiene_atraso && getStatusCompleted(item, "Retrasado") ? 1 : 0;
    const finalCompleted = getStatusCompleted(item, "Finalizado") ? 1 : 0;

    const stepsTotal = item?.tiene_atraso ? 4 : 3;
    const completedSteps =
      serviceCompleted + attentionCompleted + retrasadoCompleted + finalCompleted;

    if (!stepsTotal) return 0;
    return Math.round((Math.min(completedSteps, stepsTotal) / stepsTotal) * 100);
  };

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
        </div>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando seguimientos...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>Ticket</th>
                    <th>Tipo de Servicio</th>
                    <th>Estado</th>
                    <th>Equipo</th>
                    <th>Número Serial</th>
                    <th>Fabricante</th>
                    <th>Modelo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Estado Progreso</th>
                    <th>Progreso</th>
                    <th>Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.ticket || "—"}</td>
                        <td>{item.tipo_servicio || "—"}</td>
                        <td>
                          <Chip
                            label={item.estado || "—"}
                            color={getEstadoColor(item.estado)}
                            size="small"
                          />
                        </td>
                        <td>{item.equipo || "—"}</td>
                        <td>{item.numero_serial || "—"}</td>
                        <td>{item.fabricante || "—"}</td>
                        <td>{item.modelo || "—"}</td>
                        <td>
                          {item.fecha_inicio
                            ? new Date(item.fecha_inicio).toLocaleDateString("es-MX")
                            : "—"}
                        </td>
                        <td>
                          {item.fecha_fin
                            ? new Date(item.fecha_fin).toLocaleDateString("es-MX")
                            : "—"}
                        </td>
                        <td>
                          <Chip
                            label={item.estado_progreso || "—"}
                            color={getEstadoProgresoColor(item.estado_progreso)}
                            size="small"
                          />
                        </td>
                        <td>
                          <Box sx={{ width: "100%", minWidth: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getProgressValue(item)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {getProgressValue(item)}%
                            </Typography>
                          </Box>
                        </td>
                        <td>
                          {item.tiene_atraso ? (
                            <Chip label="Sí" color="warning" size="small" />
                          ) : (
                            <Chip label="No" color="default" size="small" />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12">No se encontraron resultados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Paginacion
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Seguimientos;