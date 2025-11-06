import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconButton, Button, Tooltip, Stack, Typography, CircularProgress } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";

const Departamento = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // Obtener departamentos
  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/departamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener departamentos");

      const data = await res.json();
      if (!data.has_error) setDepartamentos((data.data || []).slice().reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  // DELETE con confirmación
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
      const res = await fetch(`${API_URL}/departamentos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar departamento");

      Swal.fire("Eliminado", "El departamento fue eliminado correctamente", "success");
      // Actualizar lista
      fetchDepartamentos();
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo eliminar", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar y paginar
  const filteredData = departamentos.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
          <Link to="/agregar_departamento">
            <Button variant="contained" className="mx-2" color="success" endIcon={<AddCircleOutlineIcon />}>
              Agregar
            </Button>
          </Link>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando departamentos...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>ID</th>
                    <th>Nombre del Departamento</th>
                    <th>Áreas</th>
                    <th>Fecha y Hora de Alta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((dep) => (
                      <tr key={dep.id}>
                        <td>{dep.id}</td>
                        <td>{dep.nombre}</td>
                        <td>
                          {dep.areas && dep.areas.length ? (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {dep.areas.map((area) => (
                                <li key={area.id}>
                                  <strong>{area.nombre}</strong> - {area.nombre_encargado}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Sin áreas"
                          )}
                        </td>
                        <td>{new Date(dep.created_at).toLocaleString("es-MX")}</td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_departamento/${dep.id}`}>
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
                                  onClick={() => handleDelete(dep.id)}
                                  disabled={deletingId === dep.id}
                                >
                                  {deletingId === dep.id ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No se encontraron resultados.</td>
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

export default Departamento;