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
import Search from "../components/Search";
import Paginacion from "../components/Pagination";
import { API_URL } from "../config/api";

const Dashboard = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDispositivos();
  }, []);

  const fetchDispositivos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token, el usuario no está autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/dispositivos`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener dispositivos");

      const result = await response.json();
      if (!result.has_error) setDispositivos((result.data || []).slice().reverse());
    } catch (error) {
      console.error("Error en fetchDispositivos:", error);
    } finally {
      setLoading(false);
    }
  };

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
        `${API_URL}/dispositivos/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar dispositivo");

      Swal.fire("Eliminado", "El dispositivo ha sido eliminado.", "success");
      setDispositivos((prev) => prev.filter((dispositivo) => dispositivo.id !== id));
    } catch (error) {
      console.error("Error eliminando dispositivo:", error);
      Swal.fire("Error", "No se pudo eliminar el dispositivo", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  const filteredData = dispositivos.filter((item) =>
    [
      item.equipo,
      item.fabricante,
      item.modelo,
      item.no_serial,
      item.area?.nombre,
      item.departamento?.nombre,
    ]
      .filter(Boolean)
      .some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
          <Link to="/agregar_registro">
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
                <Typography mt={1}>Cargando dispositivos...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>No. Serie</th>
                    <th>Equipo</th>
                    <th>Fabricante</th>
                    <th>Modelo</th>
                    <th>Departamento</th>
                    <th>Área Específica</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.no_serial}</td>
                        <td>{item.equipo}</td>
                        <td>{item.fabricante}</td>
                        <td>{item.modelo}</td>
                        <td>{item.departamento?.nombre}</td>
                        <td>{item.area?.nombre}</td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_dispositivo/${item.id}`}>
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
                      <td colSpan="7">No se encontraron resultados.</td>
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

export default Dashboard;