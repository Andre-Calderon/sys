import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Typography, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const Altas_Pendientes = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
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
      if (!data.has_error) {
        // Filtrar solo los pendientes
        const pendientes = (data.data || []).filter(
          (item) => item.estado?.toLowerCase() === "pendiente"
        );
        setMantenimientos(pendientes.slice().reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

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
      fechaInicioMatch ||
      fechaFinMatch ||
      solucion
    );
  });

  // Filtrar filas según rol
  const roleFiltered = searchFiltered.filter((item) => {
    if (user?.role === "administrador") return true; // Admin ve todo
    if (user?.role === "ingeniero") return item.ingeniero?.id === user.user.id; // Ingeniero solo su info
    return false;
  });

  // Datos filtrados finales
  const filteredData = roleFiltered;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="right-content">
        <div className="card">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} className="search-bar" />
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando pendientes...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>Ticket</th>
                    <th>Descripción</th>
                    <th>Tipo de Servicio</th>
                    <th>Estado</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Ingeniero Asignado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.ticket || item.id}</td>
                        <td>{item.descripcion || "—"}</td>
                        <td>{item.tipo_servicio || "—"}</td>
                        <td>{item.estado || "—"}</td>
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
                          {item.ingeniero
                            ? `${item.ingeniero.nombres} ${item.ingeniero.apellido_paterno} ${item.ingeniero.apellido_materno}`
                            : "—"}
                        </td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_registro_mantenimiento/${item.id}`}>
                              <Tooltip title="Editar">
                                <IconButton color="primary">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          </Stack>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">No se encontraron resultados.</td>
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

export default Altas_Pendientes;