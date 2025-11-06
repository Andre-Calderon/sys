import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";

const Table_Pendientes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const data = [
    {
      id: 1,
      descripcion: "UPS Eaton 9PX",
      departamento: "Infraestructura",
      area: "Centro de Datos",
      prioridad: "Alta",
      fechaProgramada: "10-04-2025",
      estado: "Pendiente"
    },
    {
      id: 2,
      descripcion: "Switch Cisco Catalyst 9200",
      departamento: "Redes",
      area: "Sala de Comunicaciones",
      prioridad: "Media",
      fechaProgramada: "15-04-2025",
      estado: "Pendiente"
    },
    {
      id: 3,
      descripcion: "Laptop Dell Latitude 5420",
      departamento: "TI",
      area: "Oficina Principal",
      prioridad: "Baja",
      fechaProgramada: "18-04-2025",
      estado: "Pendiente"
    }
  ];

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleAtenderFalla = (id) => {
    alert(`Atendiendo falla del mantenimiento con ID: ${id}`);
  };

  return (
    <div className="card mt-2">
      <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
        <Search onSearch={handleSearch} className="search-bar" />
        <Button variant="contained" className="mx-2" color="success" endIcon={<AddCircleOutlineIcon />}>
          Agregar
        </Button>
      </div>
      <div className="d-flex justify-content-center align-items-center">
        <div className="table-container">
          <table className="styled-table text-center">
            <thead>
              <tr className="text-center">
                <th>ID</th>
                <th>Descripción</th>
                <th>Departamento</th>
                <th>Área</th>
                <th>Prioridad</th>
                <th>Fecha Programada</th>
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
                    <td>{item.prioridad}</td>
                    <td>{item.fechaProgramada}</td>
                    <td>
                      <Stack direction="row" spacing={1} justifyContent="center">
                          <Button onClick={() => handleAtenderFalla(item.id)} size="small" variant="contained" color="secondary">Atender</Button>
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
        </div>
      </div>
      <Paginacion
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default Table_Pendientes;