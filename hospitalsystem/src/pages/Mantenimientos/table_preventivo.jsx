import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Button, Tooltip, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";

const Table_Preventivo = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const itemsPerPage = 10;

  const data = [
    {
      id: 1,
      descripcion: "Limpieza de polvo y cambio de pasta térmica en Servidor Dell R740",
      departamento: "TI",
      area: "Centro de Datos",
      fabricante: "Dell",
      modelo: "PowerEdge R740",
      numeroSerie: "SN123456",
      ingenieroAsignado: "Juan Pérez",
      estadoEquipo: "Óptimo",
      tipoMantenimiento: "Preventivo",
      solucion: "Se realizó limpieza interna, cambio de pasta térmica y revisión de ventiladores.",
      fechaRegistro: "12-03-2025",
      proximoMantenimiento: "12-09-2025",
      observacion: "Descripción de la observación"
    },
    {
      id: 2,
      descripcion: "Verificación y actualización de firmware en Router Cisco 2901",
      departamento: "Redes",
      area: "Sala de Comunicaciones",
      fabricante: "Cisco",
      modelo: "2901",
      numeroSerie: "SN654321",
      ingenieroAsignado: "María López",
      estadoEquipo: "Bueno",
      tipoMantenimiento: "Preventivo",
      solucion: "Se actualizó el firmware y se optimizaron las configuraciones de red.",
      fechaRegistro: "15-02-2025",
      proximoMantenimiento: "15-08-2025",
      observacion: "Descripción de la observación"
    },
    {
      id: 3,
      descripcion: "Revisión de batería y optimización del sistema en Laptop HP EliteBook 840 G5",
      departamento: "Desarrollo",
      area: "Oficina Principal",
      fabricante: "HP",
      modelo: "EliteBook 840 G5",
      numeroSerie: "SN789456",
      ingenieroAsignado: "Carlos Gómez",
      estadoEquipo: "Requiere cambio de batería",
      tipoMantenimiento: "Correctivo",
      solucion: "Se realizó análisis de consumo y se recomendó cambio de batería.",
      fechaRegistro: "20-01-2025",
      proximoMantenimiento: "20-07-2025",
      observacion: "Descripción de la observación"
    }
  ];

  const handleSearch = (searchText) => setSearchTerm(searchText);

  const filteredData = data.filter((item) =>
    Object.values(item).some(value => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => setCurrentPage(value);
  const handleOpenDeleteDialog = (itemId) => { setDeleteItemId(itemId); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setDeleteItemId(null); };
  const handleDelete = () => { console.log(`Elemento con ID: ${deleteItemId} eliminado.`); handleCloseDeleteDialog(); };

  return (
    <div className="card mt-2">
      <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
        <Search onSearch={handleSearch} />
        <Link to="/agregar_registro_mantenimiento">
          <Button variant="contained" className="mx-2" color="success" endIcon={<AddCircleOutlineIcon />}>Agregar</Button>
        </Link>
      </div>
      <div className="d-flex justify-content-center align-items-center">
        <div className="table-container">
            <table className="styled-table text-center">
            <thead>
                <tr className="text-center">
                <th>ID</th>
                <th>Análisis de la tarea</th>
                <th>Departamento</th>
                <th>Área</th>
                <th>Fabricante</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Ingeniero</th>
                <th>Estado</th>
                <th>Solución</th>
                <th>Observación</th>
                <th>Próximo</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {currentItems.length ? (
                currentItems.map((item) => (
                    <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.departamento}</td>
                    <td>{item.area}</td>
                    <td>{item.fabricante}</td>
                    <td>{item.modelo}</td>
                    <td>{item.numeroSerie}</td>
                    <td>{item.ingenieroAsignado}</td>
                    <td>{item.estadoEquipo}</td>
                    <td>{item.solucion}</td>
                    <td>{item.observacion}</td>
                    <td>{item.proximoMantenimiento}</td>
                    <td>
                        <Stack direction="row" spacing={1}>
                        <Link to="/editar_registro">
                            <Tooltip title="Editar">
                            <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                        </Link>
                        <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(item.id)}>
                            <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        </Stack>
                    </td>
                    </tr>
                ))
                ) : (
                <tr><td colSpan="12">No se encontraron resultados.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
      <Paginacion totalItems={filteredData.length} itemsPerPage={itemsPerPage} currentPage={currentPage} handlePageChange={handlePageChange} />
    </div>
  );
};

export default Table_Preventivo;