import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IconButton,
  Button,
  Tooltip,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Box,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { API_URL } from "../../config/api";

const Mantenimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const itemsPerPage = 10;

  const handleSearch = (text) => setSearchTerm(text);
  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleClearDates = () => {
    setFechaInicio("");
    setFechaFin("");
    setCurrentPage(1);
  };

  // Resetear página cuando cambian los filtros de fecha
  useEffect(() => {
    setCurrentPage(1);
  }, [fechaInicio, fechaFin]);

  const { user } = useAuth();
  

  // Obtener mantenimientos
  const fetchMantenimientos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/mantenimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener mantenimientos");

      const data = await res.json();
      if (!data.has_error) setMantenimientos((data.data || []).slice().reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  // DELETE con SweetAlert
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/mantenimientos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar mantenimiento");

      Swal.fire("Eliminado", "El mantenimiento fue eliminado correctamente", "success");
      setMantenimientos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo eliminar", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar por búsqueda
  const searchFiltered = mantenimientos.filter((item) => {
    const term = searchTerm.toLowerCase();

    const idMatch = item.id.toString().includes(term);
    const ticketMatch = item.ticket?.toString().toLowerCase().includes(term);
    const descripcionMatch = item.descripcion?.toLowerCase().includes(term);
    const estadoMatch = item.estado?.toLowerCase().includes(term);
    const tipoMatch = item.tipo_servicio?.toLowerCase().includes(term);
    const ingenieroMatch = item.ingeniero
      ? `${item.ingeniero.nombres} ${item.ingeniero.apellido_paterno} ${item.ingeniero.apellido_materno}`
          .toLowerCase()
          .includes(term)
      : false;
    const adminMatch = item.administrador
      ? `${item.administrador.nombres} ${item.administrador.apellido_paterno} ${item.administrador.apellido_materno}`
          .toLowerCase()
          .includes(term)
      : false;
    const fechaInicioMatch = item.fecha_inicio
      ? new Date(item.fecha_inicio).toLocaleDateString("es-MX").includes(term)
      : false;
    const fechaFinMatch = item.fecha_fin
      ? new Date(item.fecha_fin).toLocaleDateString("es-MX").includes(term)
      : false;
    const solucion = item.solucion?.toLowerCase().includes(term);
    
    return (
      idMatch ||
      ticketMatch ||
      descripcionMatch ||
      estadoMatch ||
      tipoMatch ||
      ingenieroMatch ||
      adminMatch ||
      fechaInicioMatch ||
      fechaFinMatch ||
      solucion
    );
  });

  // FILTRADO POR RANGO DE FECHAS (filtra por fecha_inicio)
  const dateFiltered = searchFiltered.filter((item) => {
    if (!fechaInicio && !fechaFin) return true; // Sin filtro de fechas
    
    const fechaInicioItem = item.fecha_inicio ? new Date(item.fecha_inicio) : null;
    if (!fechaInicioItem) return false;

    // Ajustar fechas para comparación (solo fecha, sin hora)
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : null;

    // Ajustar hora de fechaFin al final del día para incluir todo el día
    if (fechaFinDate) {
      fechaFinDate.setHours(23, 59, 59, 999);
    }

    fechaInicioItem.setHours(0, 0, 0, 0);
    if (fechaInicioDate) fechaInicioDate.setHours(0, 0, 0, 0);

    if (fechaInicioDate && fechaFinDate) {
      return fechaInicioItem >= fechaInicioDate && fechaInicioItem <= fechaFinDate;
    } else if (fechaInicioDate) {
      return fechaInicioItem >= fechaInicioDate;
    } else if (fechaFinDate) {
      return fechaInicioItem <= fechaFinDate;
    }
    
    return true;
  });

  // Datos filtrados finales
  const filteredData = dateFiltered;

  // Filtrar filas según rol
  const roleFiltered = filteredData.filter((item) => {
    if (user?.role === "administrador") return true; // Admin ve todo
    if (user?.role === "ingeniero") return item.ingeniero?.id === user.user.id; // Ingeniero solo su info
    return false;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedItems = roleFiltered.slice(indexOfFirstItem, indexOfLastItem);

  const today = new Date();
  const alertItems =
    user?.role === "ingeniero"
      ? displayedItems
          .filter((item) => !item.solucion || item.solucion.trim() === "")
          .map((item) => {
            const fechaInicio = item.fecha_inicio ? new Date(item.fecha_inicio) : null;
            const fechaFin = item.fecha_fin ? new Date(item.fecha_fin) : null;

            if (fechaInicio && fechaFin) {
              if (fechaInicio.toDateString() === fechaFin.toDateString()) {
                return { type: "warning", item };
              }
              if (fechaFin < today) {
                return { type: "error", item };
              }
            }

            return null; // si no cumple condiciones, se descarta
          })
          .filter(Boolean) // elimina los null
      : [];

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-between align-items-center mt-2 mb-3 p-2">
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Search onSearch={handleSearch} />
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <DateRangeIcon sx={{ color: "var(--color-primary)" }} />
              <TextField
                type="date"
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  width: 180,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
              <TextField
                type="date"
                label="Fecha Fin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  width: 180,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--color-primary)" },
                    "&:hover fieldset": { borderColor: "var(--color-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-secondary)" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-secondary)" },
                }}
              />
              {(fechaInicio || fechaFin) && (
                <Tooltip title="Limpiar filtro de fechas">
                  <IconButton onClick={handleClearDates} color="primary" size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          {user?.role === "administrador" && (
            <Link to="/agregar_registro_mantenimiento">
              <Button
                variant="contained"
                className="mx-2"
                color="success"
                endIcon={<AddCircleOutlineIcon />}
              >
                Agregar
              </Button>
            </Link>
          )}
        </div>

        <div className="">
            {alertItems.length > 0 && (
              <Stack spacing={2} mb={2}>
                {alertItems.map(({ type, item }) => (
                  <Alert
                    key={item.id}
                    severity={type}
                    action={
                      <Link 
                        to="/agregar_atraso" 
                        state={{ mantenimiento: item }}
                      >
                        <Button
                          color="inherit"
                          size="small"
                        >
                          Generar Ticket
                        </Button>
                      </Link>
                    }
                  >
                    {type === "warning"
                      ? `Por favor suba su solución y atienda el equipo (Ticket ${item.ticket || item.id})`
                      : `¡Atención! El mantenimiento con Ticket ${item.ticket || item.id} ya venció sin solución.`}
                  </Alert>
                ))}
              </Stack>
            )}
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando mantenimientos...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>Ticket</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Tipo de Servicio</th>
                    <th>Ingeniero</th>
                    <th>Administrador</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Solución</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                 {displayedItems.length ? (
                    displayedItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.ticket || item.id}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.estado}</td>
                        <td>{item.tipo_servicio}</td>
                        <td>
                          {item.ingeniero
                            ? `${item.ingeniero.nombres} ${item.ingeniero.apellido_paterno} ${item.ingeniero.apellido_materno}`
                            : "-"}
                        </td>
                        <td>
                          {item.administrador
                            ? `${item.administrador.nombres} ${item.administrador.apellido_paterno} ${item.administrador.apellido_materno}`
                            : "-"}
                        </td>
                        <td>{item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString("es-MX") : "-"}</td>
                        <td>{item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString("es-MX") : "-"}</td>
                        <td>{ item.solucion }</td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {/* Editar y eliminar solo para administrador */}
                            {user?.role === "administrador" && (
                              <>
                                <Link to={`/editar_registro_mantenimiento/${item.id}`}>
                                  <Tooltip title="Editar">
                                    <IconButton size="small" color="primary">
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Link>

                                <Tooltip title="Eliminar">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(item.id)}
                                      disabled={deletingId === item.id}
                                    >
                                      {deletingId === item.id ? (
                                        <CircularProgress size={18} />
                                      ) : (
                                        <DeleteIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}

                            {/* Atender solo para ingeniero */}
                            {user?.role === "ingeniero" && (
                              <Link to={`/editar_registro_mantenimiento/${item.id}`}>
                                <Tooltip title="Atender mantenimiento">
                                  <IconButton size="small" color="secondary">
                                    <NoteAltIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Link>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="15">No se encontraron resultados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Paginacion
          totalItems={roleFiltered.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Mantenimientos;