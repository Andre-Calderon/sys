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
import { useAuth } from "../../context/AuthContext";

const Atrasados = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const itemsPerPage = 5;
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.has_error) {
        setTickets((data.data || []).slice().reverse());;
      } else {
        setErrorMsg(data.message || "Error al obtener tickets");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor");
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

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        Swal.fire("Error", "El servidor no respondió correctamente", "error");
        return;
      }

      if (res.ok && !result.has_error) {
        Swal.fire("Eliminado", result.message, "success");
        setTickets((prev) => prev.filter((t) => t.id !== id));
      } else {
        Swal.fire("Error", result.message || "No se pudo eliminar", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  };

  const handleSearch = (text) => setSearchTerm(text);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // FILTRADO Y PAGINACIÓN
  const filteredData = tickets.filter((t) =>
    Object.values(t).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

// FILTRADO SEGÚN ROL
const roleFilteredTickets =
  user?.role === "ingeniero"
    ? filteredData.filter((t) => t.ing_id === user.user.id) // solo sus tickets
    : filteredData; // administradores u otros roles ven todo

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = roleFilteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="right-content">
      <div className="card mt-2">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} />
          <Link to="/agregar_atraso">
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

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CircularProgress />
                <Typography mt={1}>Cargando tickets...</Typography>
              </div>
            ) : (
              <table className="styled-table text-center">
                <thead>
                  <tr className="text-center">
                    <th>ID</th>
                    <th>Dispositivo ID</th>
                    <th>Ingeniero ID</th>
                    <th>Fecha creación</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.disp_med_id}</td>
                        <td>{t.ing_id}</td>
                        <td>{t.fecha_creacion}</td>
                        <td>{t.prioridad}</td>
                        <td>{t.estado}</td>
                        <td>{t.descripcion_problema}</td>
                        <td>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Link to={`/editar_atraso/${t.id}`}>
                              <Tooltip title="Editar">
                                <IconButton color="primary">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Link>
                            <Tooltip title="Eliminar">
                              <IconButton color="error" onClick={() => handleDelete(t.id)}>
                                <DeleteIcon />
                              </IconButton>
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

export default Atrasados;