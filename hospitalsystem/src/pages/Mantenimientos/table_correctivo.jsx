import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { Button, Tabs, Tab } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Tooltip from "@mui/material/Tooltip";
import Search from "../../components/Search";
import PieChartIcon from "@mui/icons-material/PieChart";
import Paginacion from "../../components/Pagination";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const Table_Correctivo = () => {
          const [currentPage, setCurrentPage] = useState(1);
          const [searchTerm, setSearchTerm] = useState("");
          const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
          const [deleteItemId, setDeleteItemId] = useState(null); // Estado para almacenar el ID del item a eliminar
          const [tabValue, setTabValue] = useState(0);
          const itemsPerPage = 10;
        
          const data = [
            {
              id: 1,
              descripcion: "Servidor Dell PowerEdge R740",
              departamento: "TI",
              area: "Centro de Datos",
              fabricante: "Dell",
              modelo: "R740",
              numeroSerie: "SN123456",
              ingenieroAsignado: "Juan Pérez",
              solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
              fechaRegistro: "12-09-2024",
              observacion:"Descripcion de la observación.",
            },
            {
              id: 2,
              descripcion: "Router Cisco 2901",
              departamento: "Redes",
              area: "Sala de Comunicaciones",
              fabricante: "Cisco",
              modelo: "2901",
              numeroSerie: "SN654321",
              ingenieroAsignado: "María López",
              solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
              fechaRegistro: "15-08-2024",
              observacion:"Descripcion de la observación.",
            },
            {
              id: 3,
              descripcion: "Laptop HP EliteBook 840 G5",
              departamento: "Desarrollo",
              area: "Oficina Principal",
              fabricante: "HP",
              modelo: "EliteBook 840 G5",
              numeroSerie: "SN789456",
              ingenieroAsignado: "Carlos Gómez",
              solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
              fechaRegistro: "20-07-2024",
              observacion:"Descripcion de la observación.",
            },
            {
                id: 4,
                descripcion: "Servidor Dell PowerEdge R740",
                departamento: "TI",
                area: "Centro de Datos",
                fabricante: "Dell",
                modelo: "R740",
                numeroSerie: "SN123456",
                ingenieroAsignado: "Juan Pérez",
                solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
                fechaRegistro: "12-09-2024",
                observacion:"Descripcion de la observación.",
              },
              {
                id: 5,
                descripcion: "Router Cisco 2901",
                departamento: "Redes",
                area: "Sala de Comunicaciones",
                fabricante: "Cisco",
                modelo: "2901",
                numeroSerie: "SN654321",
                ingenieroAsignado: "María López",
                solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
                fechaRegistro: "15-08-2024",
                observacion:"Descripcion de la observación.",
              },
              {
                id: 6,
                descripcion: "Laptop HP EliteBook 840 G5",
                departamento: "Desarrollo",
                area: "Oficina Principal",
                fabricante: "HP",
                modelo: "EliteBook 840 G5",
                numeroSerie: "SN789456",
                ingenieroAsignado: "Carlos Gómez",
                solucion: "Lorem impsun data text descripción detallada de la solución, asi como el cambio o retiro de piezas",
                fechaRegistro: "20-07-2024",
                observacion:"Descripcion de la observación.",
              }
          ];
        
          const handleSearch = (searchText) => {
            setSearchTerm(searchText);
          };
        
          const filteredData = data.filter((item) => {
            return (
              item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.ingenieroAsignado.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.solucion.toString().includes(searchTerm) ||
              item.fechaRegistro.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        
          const indexOfLastItem = currentPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
        
          const handlePageChange = (event, value) => {
            setCurrentPage(value);
          };
        
          // Función para abrir el diálogo de eliminación
          const handleOpenDeleteDialog = (itemId) => {
            setDeleteItemId(itemId);
            setOpenDeleteDialog(true);
          };
        
          // Función para cerrar el diálogo de eliminación
          const handleCloseDeleteDialog = () => {
            setOpenDeleteDialog(false);
            setDeleteItemId(null);
          };
        
          // Función de confirmación de eliminación
          const handleDelete = () => {
            // Aquí puedes implementar la lógica para eliminar el elemento
            console.log(`Elemento con ID: ${deleteItemId} eliminado.`);
            handleCloseDeleteDialog(); // Cerrar el diálogo después de eliminar
          };
    
          const handleChangeTab = (event, newValue) => {
            setTabValue(newValue);
          };    
    
    return(

        <div className="card mt-2">
            <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
            <Search onSearch={handleSearch} className="search-bar" />
            <Link to="/agregar_registro_mantenimiento">
                <Button variant="contained" className="mx-2" color="success" endIcon={<AddCircleOutlineIcon />}>
                Agregar
                </Button>
            </Link>
            </div>
    
            <div className="d-flex justify-content-center align-items-center">
            <div className="table-container">
                <table className="styled-table text-center">
                <thead>
                    <tr className="text-center">
                    <th>ID</th>
                    <th>Descripción de la falla</th>
                    <th>Departamento</th>
                    <th>Área específica</th>
                    <th>Fabricante</th>
                    <th>Modelo</th>
                    <th>Número de Serie</th>
                    <th>Ingeniero asignado</th>
                    <th>Solución</th>
                    <th>Observación</th>
                    <th>Fecha de registro</th>
                    <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
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
                        <td>{item.solucion}</td>
                        <td>{item.observacion}</td>
                        <td>{item.fechaRegistro}</td>
                        <td>
                            <div className="d-flex actions justify-content-around">
                            <Stack direction="row" spacing={1}>
                                <Link to="/editar_registro">
                                <Tooltip title="Editar" placement="top">
                                    <IconButton aria-label="edit" size="small" color="primary">
                                    <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                </Link>
                                <Link to="#" onClick={() => handleOpenDeleteDialog(item.id)}>
                                <Tooltip title="Eliminar" placement="top">
                                    <IconButton aria-label="delete" size="small" color="error">
                                    <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                </Link>
                            </Stack>
                            </div>
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="10">No se encontraron resultados.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
    
            <Paginacion
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            />
        </div>

    )
}

export default Table_Correctivo;