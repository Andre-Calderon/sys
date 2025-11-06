import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Search from "../../components/Search";
import Paginacion from "../../components/Pagination";

const Rendimiento_General = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const data = [
    {
      id: 1,
      nombres: "Carlos",
      apellidos: "López",
      mantenimientos: 10,
      rendimiento_general: "85%",
      atrasos: 2,
      correctivos: 3,
      preventivos: 7
    },
    {
      id: 2,
      nombres: "María",
      apellidos: "González",
      mantenimientos: 8,
      rendimiento_general: "90%",
      atrasos: 1,
      correctivos: 2,
      preventivos: 6
    },
    {
      id: 3,
      nombres: "Juan",
      apellidos: "Pérez",
      mantenimientos: 5,
      rendimiento_general: "75%",
      atrasos: 3,
      correctivos: 1,
      preventivos: 4
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

  return (
    <div className="right-content">
      <div className="card">
        <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
          <Search onSearch={handleSearch} className="search-bar" />
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <div className="table-container">
            <table className="styled-table text-center">
              <thead>
                <tr>
                  <th colSpan="8" className="table-title text-center" style={{ background: "var(--color-bitacora)" }}>
                    Rendimiento General de Mantenimientos
                  </th>
                </tr>
                <tr className="text-center">
                  <th>ID</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Mantenimientos</th>
                  <th>Rendimiento General %</th>
                  <th>Atrasos (En espera)</th>
                  <th>Correctivos</th>
                  <th>Preventivos</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.nombres}</td>
                      <td>{item.apellidos}</td>
                      <td>{item.mantenimientos}</td>
                      <td>{item.rendimiento_general}</td>
                      <td>{item.atrasos}</td>
                      <td>{item.correctivos}</td>
                      <td>{item.preventivos}</td>
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
    </div>
  );
};

export default Rendimiento_General;