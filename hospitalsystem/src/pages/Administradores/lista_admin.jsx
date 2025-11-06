import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IconButton,
  Button,
  Tooltip,
  Stack,
  Typography,
  Alert,
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

const Lista_administradores = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const fetchAdministradores = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/administradores`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Error GET administradores:", text);
        throw new Error("Error al obtener administradores");
      }

      const result = await response.json();
      if (!result.has_error) {
        setAdmins((result.data || []).slice().reverse());;
      } else {
        setErrorMsg(result.message || "Error al obtener administradores");
      }
    } catch (err) {
      console.error("fetchAdministradores:", err);
      setErrorMsg(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al administrador y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Usuario no autenticado");

          const response = await fetch(
            `${API_URL}/administradores/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const text = await response.text();
            console.error("Error DELETE administradores:", text);
            throw new Error("Error al eliminar administrador");
          }

          // Si el backend responde JSON con mensaje, lo mostramos; si no, usamos mensaje por defecto
          let resultJson = null;
          try {
            resultJson = await response.json();
          } catch (err) {
            /* no JSON en respuesta, lo ignoramos */
          }

          const successMessage =
            (resultJson && !resultJson.has_error && resultJson.message) ||
            "Administrador eliminado correctamente";

          Swal.fire("Eliminado", successMessage, "success");
          setAdmins((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
          console.error("handleDelete:", err);
          Swal.fire(
            "Error",
            err.message || "No se pudo eliminar el administrador",
            "error"
          );
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Filtrado (busca en todos los campos del objeto)
  const filtered = admins.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
          <Link to="/agregar_administrador">
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

        {errorMsg && (
          <div style={{ padding: "0 16px 8px 16px" }}>
            <Alert severity="error">{errorMsg}</Alert>
          </div>
        )}

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando administradores...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>ID</th>
                    <th>Nombres</th>
                    <th>Apellido Paterno</th>
                    <th>Apellido Materno</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Género</th>
                    <th>Fecha de Alta</th>
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
                          {new Date(item.created_at).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_administrador/${item.id}`}>
                              <Tooltip title="Editar">
                                <IconButton size="small" color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Link>
                            <Tooltip title="Eliminar">
                              <span>
                                {/* envolvemos en span para poder desactivar el tooltip cuando el botón esté deshabilitado */}
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
                      <td colSpan="9">No se encontraron resultados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Paginacion
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Lista_administradores;