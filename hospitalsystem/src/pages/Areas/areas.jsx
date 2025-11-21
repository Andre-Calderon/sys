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

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Consumir API de áreas
  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token, el usuario no está autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/areas`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener áreas específicas");

      const result = await response.json();
      if (!result.has_error) {
        // Último registro primero
        setAreas((result.data || []).slice().reverse());
      }
    } catch (error) {
      console.error("Error en fetchAreas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un área editada sin mover su posición
  const handleUpdateArea = (updatedArea) => {
    setAreas((prev) =>
      prev.map((area) => (area.id === updatedArea.id ? updatedArea : area))
    );
  };

  // Eliminar un área con SweetAlert2
  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_URL}/areas/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) throw new Error("Error al eliminar área");

          Swal.fire("Eliminado", "El área específica ha sido eliminada.", "success");

          setAreas((prev) => prev.filter((area) => area.id !== id));
        } catch (error) {
          console.error("Error eliminando área:", error);
          Swal.fire("Error", "No se pudo eliminar el área específica", "error");
        }
      }
    });
  };

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // Filtrar por búsqueda
  const filteredData = areas.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
          <Link to="/agregar_area">
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
                <Typography mt={1}>Cargando áreas específicas...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>Nombre del Área Específica</th>
                    {/* <th>Encargado</th> */}
                    <th>Fecha de Alta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nombre}</td>
                        {/* <td>{item.nombre_encargado}</td> */}
                        <td>
                          {new Date(item.created_at).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent={"center"}
                          >
                            <Link to={`/editar_area/${item.id}`} state={{ area: item }}>
                              <Tooltip title="Editar">
                                <IconButton size="small" color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Link>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(item.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No se encontraron resultados.</td>
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

export default Areas;