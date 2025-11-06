import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconButton, Button, Tooltip, Stack, CircularProgress, Typography, Alert } from "@mui/material";
import "../assets/styles/cardAdminHome.css";
import PersonIcon from "@mui/icons-material/Person";
import ComputerIcon from "@mui/icons-material/Computer";
import BuildIcon from "@mui/icons-material/Build";
import ErrorIcon from '@mui/icons-material/Error';
import StarIcon from '@mui/icons-material/Star';
import { API_URL } from "../config/api";

const Home_Admin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener datos del dashboard");

      const result = await response.json();
      if (!result.has_error && result.data) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || "Error al obtener datos");
      }
    } catch (err) {
      console.error("Error en fetchDashboardData:", err);
      setError(err.message || "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchText) => setSearchTerm(searchText);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // Obtener top 3 ingenieros mejor calificados
  const topIngenieros = dashboardData?.calificaciones?.por_ingeniero || [];
  const filteredData = topIngenieros.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(0, 3); // Solo mostrar top 3

  if (loading) {
    return (
      <div className="right-content">
        <div style={{ padding: 50, textAlign: "center" }}>
          <CircularProgress />
          <Typography mt={2}>Cargando dashboard...</Typography>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="right-content">
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const mantenimientos = dashboardData?.mantenimientos || {};
  const ticketsAtraso = dashboardData?.tickets_atraso || {};
  const topIngenierosData = dashboardData?.calificaciones?.por_ingeniero || [];
  const mejorIngeniero = topIngenierosData[0] || null;
  const ingenieros = dashboardData?.ingenieros || {};
  const dispositivos = dashboardData?.dispositivos || {};
  const estadisticas = dashboardData?.estadisticas_generales || {};
  const mantenimientosPorEstado = mantenimientos.por_estado || {};
  const mantenimientosPorTipo = mantenimientos.por_tipo_servicio || {};
  
  const totalPreventivos = mantenimientos.este_mes?.preventivos || 0;
  const totalCorrectivos = mantenimientos.este_mes?.correctivos || 0;
  const totalMantenimientos = mantenimientos.este_mes?.total || 0;
  const porcentajeCorrectivos = totalMantenimientos > 0 ? Math.round((totalCorrectivos / totalMantenimientos) * 100) : 0;
  
  // Calcular porcentaje de mantenimientos activos
  const mantenimientosFinalizados = mantenimientosPorEstado?.Finalizado || 0;
  const mantenimientosPendientes = mantenimientosPorEstado?.Pendiente || 0;
  const mantenimientosEnProceso = mantenimientosPorEstado?.["En proceso"] || 0;
  const mantenimientosActivos = mantenimientosPendientes + mantenimientosEnProceso;
  const totalMantenimientosEstado = mantenimientosFinalizados + mantenimientosActivos;
  const porcentajeActivos = totalMantenimientosEstado > 0 ? Math.round((mantenimientosActivos / totalMantenimientosEstado) * 100) : 0;

  return (
    <div className="right-content">
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      
      <div className="row">
        <div className="col-md-4 col-xl-3">
          <div className="card bg-c-blue order-card" style={{ height: "100%", minHeight: "180px", display: "flex", flexDirection: "column" }}>
            <div className="card-block" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h6 className="m-b-20" style={{ marginBottom: "15px", fontSize: "14px" }}>Mantenimientos activos</h6>
              <h2 className="text-right d-flex justify-content-between align-items-center" style={{ marginBottom: "15px", fontSize: "32px" }}>
                <BuildIcon /> <span>{kpis.mantenimientos_activos || 0}</span>
              </h2>
              <p className="m-b-0" style={{ marginTop: "auto", fontSize: "13px" }}>
                {mantenimientosActivos > 0 ? `${mantenimientosPendientes} Pendientes, ${mantenimientosEnProceso} En proceso` : "Sin activos"}
                <span className="f-right">{porcentajeActivos}%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-xl-3">
          <div className="card bg-c-green order-card" style={{ height: "100%", minHeight: "180px", display: "flex", flexDirection: "column" }}>
            <div className="card-block" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h6 className="m-b-20" style={{ marginBottom: "15px", fontSize: "14px" }}>Mantenimientos este mes</h6>
              <h2 className="text-right d-flex justify-content-between align-items-center" style={{ marginBottom: "15px", fontSize: "32px" }}>
                <BuildIcon /> <span>{mantenimientos.este_mes?.total || kpis.mantenimientos_este_mes || 0}</span>
              </h2>
              <p className="m-b-0" style={{ marginTop: "auto", fontSize: "13px" }}>
                Finalizados<span className="f-right">{kpis.mantenimientos_finalizados_mes || 0}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-xl-3">
          <div className="card bg-c-yellow order-card" style={{ height: "100%", minHeight: "180px", display: "flex", flexDirection: "column" }}>
            <div className="card-block" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h6 className="m-b-20" style={{ marginBottom: "15px", fontSize: "14px" }}>Tickets pendientes</h6>
              <h2 className="text-right d-flex justify-content-between align-items-center" style={{ marginBottom: "15px", fontSize: "32px" }}>
                <ErrorIcon /> <span>{kpis.tickets_pendientes || 0}</span>
              </h2>
              <p className="m-b-0" style={{ marginTop: "auto", fontSize: "13px" }}>
                {ticketsAtraso.por_prioridad ? 
                  `Alta: ${ticketsAtraso.por_prioridad.Alta || 0}` : "Sin datos"}
                <span className="f-right">Total</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-xl-3">
          <div className="card bg-c-pink order-card" style={{ height: "100%", minHeight: "180px", display: "flex", flexDirection: "column" }}>
            <div className="card-block" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h6 className="m-b-20" style={{ marginBottom: "15px", fontSize: "14px" }}>Calificación promedio</h6>
              <h2 className="text-right d-flex justify-content-between align-items-center" style={{ marginBottom: "15px", fontSize: "32px" }}>
                <StarIcon /> <span>{kpis.calificacion_promedio?.toFixed(1) || "0.0"}</span>
              </h2>
              <p className="m-b-0" style={{ marginTop: "auto", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {mejorIngeniero ? mejorIngeniero.nombre : "Sin calificaciones"}
                <span className="f-right">{kpis.calificacion_promedio?.toFixed(1) || "0.0"}★</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px", marginBottom: "20px" }}>
        <div className="card text-center">
          <div className="card-header">
            <ErrorIcon color="error"></ErrorIcon>
          </div>
          <div className="card-body">
            <h5 className="card-title">Tickets de atraso pendientes</h5>
            <p className="card-text">Total: <h5>{kpis.tickets_pendientes || ticketsAtraso.pendientes || 0}</h5></p>
            <Link to="/mantenimientos_atrasados">
              <Button variant="contained" color="secondary">Ver atrasos</Button>
            </Link>
          </div>
          <div className="card-footer text-body-secondary">
            Nota: Estos mantenimientos han sido atrasados de acuerdo a su nivel de prioridad o algún otro motivo de los ingenieros asignados.
          </div>
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
                        <th>Nombre</th>
                        <th>Calificaciones</th>
                        <th>Promedio</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                        currentItems.map((item, index) => (
                            <tr key={item.id || index}>
                            <td>{item.id || index + 1}</td>
                            <td>{item.nombre || "N/A"}</td>
                            <td>{item.total_calificaciones || 0}</td>
                            <td>{item.promedio ? `${item.promedio.toFixed(1)}★` : "—"}</td>
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
                            <td colSpan="5">No se encontraron resultados.</td>
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

export default Home_Admin;