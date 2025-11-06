import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IconButton,
  Button,
  Tooltip,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const { user } = useAuth();

  // Consumir API de calificaciones
  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);

      const response = await fetch(
        `${API_URL}/calificaciones`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener calificaciones");

      const result = await response.json();
      if (!result.has_error) setCalificaciones((result.data || []).slice().reverse());
    } catch (error) {
      console.error("Error en fetchCalificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una calificación con SweetAlert2
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
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
      const response = await fetch(
        `${API_URL}/calificaciones/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar calificación");

      Swal.fire("Eliminado", "La calificación ha sido eliminada.", "success");
      setCalificaciones((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error eliminando calificación:", error);
      Swal.fire("Error", "No se pudo eliminar la calificación", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // Filtrar por búsqueda
  const filteredData = calificaciones.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

        // Filtrar filas según rol
  const displayedItems = currentItems.filter((item) => {
    if (user?.role === "administrador") return true; // Admin ve todo
    if (user?.role === "ingeniero") return item.ing_id === user.user.id; // Ingeniero solo su info
    return false;
  });

    return (
    <div className="right-content">
      <div className="card mt-2">
        {/* Mostrar buscador y agregar solo para admin */}
        {user?.role === "administrador" && (
          <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
            <Search onSearch={handleSearch} />
            <Link to="/agregar_calificacion">
              <Button
                variant="contained"
                className="mx-2"
                color="success"
                endIcon={<AddCircleOutlineIcon />}
              >
                Agregar
              </Button>
            </Link>
          </div>
        )}

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando calificaciones...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>ID</th>
                    <th>Ingeniero</th>
                    <th>Puntuación</th>
                    <th>Comentario</th>
                    <th>Fecha creación</th>
                    {user?.role === "administrador" && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.length ? (
                    displayedItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.ing_id}</td>
                        <td>{item.puntuacion}</td>
                        <td>{item.comentario || "—"}</td>
                        <td>{new Date(item.fecha_creacion).toLocaleDateString("es-MX")}</td>
                        {user?.role === "administrador" && (
                          <td>
                            <Stack direction="row" spacing={1} justifyContent={"center"}>
                              <Link to={`/editar_calificacion/${item.id}`}>
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
                            </Stack>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user?.role === "administrador" ? 6 : 5}>
                        No se encontraron resultados.
                      </td>
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

export default Calificaciones;