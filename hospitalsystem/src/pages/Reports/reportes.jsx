import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Button, Tooltip, Stack } from "@mui/material";
import "../../assets/styles/cardAdminHome.css";
import PersonIcon from "@mui/icons-material/Person";
import ComputerIcon from "@mui/icons-material/Computer";
import BuildIcon from "@mui/icons-material/Build";
import ErrorIcon from '@mui/icons-material/Error';

// Datos iniciales de áreas
const areasData = [
  { id: 1, nombres: "Pedro Iñigo", apellidos: "Ramírez Uc", mantenimientos: "25", rendimiento: "11%" },
  { id: 2, nombres: "Carlos Eduardo", apellidos: "Sánchez Ibarra", mantenimientos: "19", rendimiento: "9%" },
  { id: 3, nombres: "Emilio Enrique", apellidos: "Martínez Cuevas", mantenimientos: "18", rendimiento: "8%" },
];

const Reportes = () => {
      const [currentPage, setCurrentPage] = useState(1);
      const [searchTerm, setSearchTerm] = useState("");
      const itemsPerPage = 10;
    
      const handleSearch = (searchText) => setSearchTerm(searchText);
    
      // Filtrar los datos según el término de búsqueda
      const filteredData = areasData.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    
      const handlePageChange = (event, value) => setCurrentPage(value);
    return(
        <div className="right-content">
            <div className="row">
                <div className="col-md-4 col-xl-3">
                    <div className="card bg-c-blue order-card">
                        <div className="card-block">
                            <h6 className="m-b-20">Mejor desempeño</h6>
                            <h2 className="text-right d-flex justify-content-between align-items-center">
                                <PersonIcon /> <span>25</span>
                            </h2>
                            <p className="m-b-0">Ing. Pedro Ramírez<span className="f-right">11%</span></p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-xl-3">
                    <div className="card bg-c-green order-card">
                        <div className="card-block">
                            <h6 className="m-b-20">Servicios realizados</h6>
                            <h2 className="text-right d-flex justify-content-between align-items-center">
                                <BuildIcon /> <span>220</span>
                            </h2>
                            <p className="m-b-0">Completados<span className="f-right">220</span></p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-xl-3">
                    <div className="card bg-c-yellow order-card">
                        <div className="card-block">
                            <h6 className="m-b-20">Mantenimientos correctivos</h6>
                            <h2 className="text-right d-flex justify-content-between align-items-center">
                                <BuildIcon /> <span>100</span>
                            </h2>
                            <p className="m-b-0">Porcentaje<span className="f-right">48%</span></p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-xl-3">
                    <div className="card bg-c-pink order-card">
                        <div className="card-block">
                            <h6 className="m-b-20">Equipo de mayor uso</h6>
                            <h2 className="text-right d-flex justify-content-between align-items-center">
                                <ComputerIcon /> <span>Rayos X</span>
                            </h2>
                            <p className="m-b-0">Porcentaje de uso<span className="f-right">35%</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card text-center mt-2">
                <div class="card-header">
                    <ErrorIcon color="error"></ErrorIcon>
                </div>
                <div class="card-body">
                    <h5 class="card-title">Servicios de mantenimiento en espera</h5>
                    <p class="card-text">Total: <h5>10</h5></p>
                    <Link to="/altas_pendientes">
                      <Button variant="contained" color="secondary">Ver atrasos</Button>
                    </Link>
                </div>
                <div class="card-footer text-body-secondary">
                    Nota: Estos mantenimientos han sido atrasados de acuerdo a su nivel de prioridad o algún otro motivo de los ingenieros asigandos.
                </div>
            </div>

            <div className="card mt-2">
                <div className="table-header d-flex justify-content-end align-items-center mt-2 mb-3 p-2">
                <Link to="/rendimiento_general">
                    <Button variant="contained" className="mx-2" color="primary">
                    Ver todos los rendimientos
                    </Button>
                </Link>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                <div className="table-container">
                    <table className="styled-table text-center">
                    <thead>
                        <tr>
                        <th colSpan="10" className="table-title text-center" style={{ background: "var(--color-bitacora)" }}>
                            Lista de los mejores tres rendimientos
                        </th>
                        </tr>
                        <tr className="text-center">
                        <th>ID</th>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Mantenimientos</th>
                        <th>Rendimiento</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                        currentItems.map((item) => (
                            <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.nombres}</td>
                            <td>{item.apellidos}</td>
                            <td>{item.mantenimientos}</td>
                            <td>{item.rendimiento}</td>
                            <td>
                                <Stack direction="row" spacing={1} justifyContent={"center"}>
                                    <Link to="/rendimiento_personal">
                                  <Button size="small" variant="contained" style={{background:"var(--color-secondary)"}}>
                                    Ver rendimiento</Button>
                                    </Link>
                                </Stack>
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="6">No se encontraron resultados.</td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    );
}

export default Reportes;