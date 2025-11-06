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
import { API_URL } from "../../config/api";

const Ingenieros = () => {
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchIngenieros();
  }, []);

  const fetchIngenieros = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado");

      const response = await fetch(
        `${API_URL}/ingenieros`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener ingenieros");

      const result = await response.json();
      if (!result.has_error) setIngenieros((result.data || []).slice().reverse());
    } catch (error) {
      console.error("Error en fetchIngenieros:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(
        `${API_URL}/ingenieros/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        Swal.fire("Error", "El servidor no respondió correctamente", "error");
        return;
      }

      if (response.ok && !result.has_error) {
        Swal.fire("Eliminado", result.message, "success");
        setIngenieros((prev) => prev.filter((item) => item.id !== id));
      } else {
        Swal.fire("Error", result.message || "No se pudo eliminar", "error");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // FILTRAR Y PAGINAR
  const filteredData = ingenieros.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
          <Link to="/agregar_ingeniero">
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

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando ingenieros...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido Paterno</th>
                    <th>Apellido Materno</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Género</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.nombres}</td>
                        <td>{item.apellido_paterno}</td>
                        <td>{item.apellido_materno}</td>
                        <td>{item.email}</td>
                        <td>{item.telefono}</td>
                        <td>{item.genero ? "Masculino" : "Femenino"}</td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_ingeniero/${item.id}`}>
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

export default Ingenieros;