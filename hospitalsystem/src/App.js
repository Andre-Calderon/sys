import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Add_Dashboard from "./pages/Dashboard/form_add";
import Edit_Dashboard from "./pages/Dashboard/form_edit";
import Chart_pie from "./pages/Charts/chart";
import Reportes from "./pages/Reports/reportes";
import Home_Admin from "./components/Main";
import Login from "./pages/Login";

import { AuthProvider } from "./context/AuthContext";
import Reset_Pass from "./pages/Login/Reset/reset_pass";
import Code_Security from "./pages/Login/Reset/code_security";
import Email_Verify from "./pages/Login/Reset/email_verify";
import Usuarios from "./pages/Usuarios/user";
import Departamento from "./pages/Departamento/departamento";
import Areas from "./pages/Areas/areas";
import Desempeno from "./pages/Desempeños/desempeños";
import Mantenimientos from "./pages/Mantenimientos";
import Add_Mantenimiento from "./pages/Mantenimientos/form_add";
import Edit_Mantenimiento from "./pages/Mantenimientos/form_edit";
import Altas_Pendientes from "./pages/Pendientes/altas";
import Rendimiento_Personal from "./pages/Reports/rend_personal";
import Rendimiento_General from "./pages/Reports/rend_general";
import Seguimientos from "./pages/Seguimientos/seguimientos";
import Add_Users from "./pages/Usuarios/add_form";
import Edit_Departamento from "./pages/Departamento/edit_form";
import Add_Departamento from "./pages/Departamento/add_form";
import Add_Atraso from "./pages/Atrasos/add_form";
import Edit_Atraso from "./pages/Atrasos/edit_form";
import Atrasados from "./pages/Atrasos/atrasados";
import Add_Area from "./pages/Areas/add_form";
import Edit_Area from "./pages/Areas/edit_form";
import Edit_User from "./pages/Usuarios/edit_form";
import Lista_Administradores from "./pages/Administradores/lista_admin";
import Agregar_Admin from "./pages/Administradores/add_form";
import Editar_Admin from "./pages/Administradores/edit_form";
import Calificaciones from "./pages/Desempeños/calificaciones";
import Calificaciones_Agregar from "./pages/Desempeños/form_add";
import Calificaciones_Editar from "./pages/Desempeños/form_edit";
import Mi_Perfil from "./pages/Perfil/mi_perfil";

function AppContent() {

  const location = useLocation();
  const isLoginRoute = 
     location.pathname === "/login" ||
     location.pathname === "/reset-password" ||
     location.pathname === "/code-security" ||
     location.pathname === "/new_password" ||
     location.pathname === "/cargando";

  return (
    <>
      {!isLoginRoute && <Header></Header>}
      <div className="main d-flex">
        {!isLoginRoute && (
          <div className="sidebarWrapper">
            <Sidebar></Sidebar>
          </div>
        )}
        <div className={`content ${isLoginRoute ? "full-width" : ""}`}>
          <Routes>
            {/* URL´s Login */}
            <Route path="/" element={<Navigate to="/login"></Navigate>} />
            <Route path="/login" element={<Login></Login>} />
            {/* URL´s Restauración de contraseña */}
            <Route path="/reset-password" element={<Email_Verify></Email_Verify>} />
            <Route path="/code-security" element={<Code_Security></Code_Security>} />
            <Route path="/new_password" element={<Reset_Pass></Reset_Pass>} />
            {/* URL's de las homepages o páginas de inicio */}
            <Route path="/Inicio" element={<Home_Admin></Home_Admin>} />
            {/* URL's de registros de equipos  */}
            <Route path="/registros_equipos" element={<Dashboard></Dashboard>} />
            <Route path="/agregar_registro" element={<Add_Dashboard></Add_Dashboard>} />
            <Route path="/editar_dispositivo/:id" element={<Edit_Dashboard></Edit_Dashboard>} />
            {/* URL's de registros de usuarios ADMINISTRADORES*/}
            <Route path="/registro_administradores" element={<Lista_Administradores></Lista_Administradores>} />
            <Route path="/agregar_administrador" element={<Agregar_Admin></Agregar_Admin>} />
            <Route path="/editar_administrador/:id" element={<Editar_Admin></Editar_Admin>} />
            {/* URL's de registros de usuarios INGENIEROS */}
            <Route path="/registro_ingenieros" element={<Usuarios></Usuarios>} />
            <Route path="/agregar_ingeniero" element={<Add_Users></Add_Users>} />
            <Route path="/editar_ingeniero/:id" element={<Edit_User></Edit_User>} />
            {/* URL's de mantenimientos */}
            <Route path="/registros_mantenimientos" element={<Mantenimientos></Mantenimientos>} />
            <Route path="/agregar_registro_mantenimiento" element={<Add_Mantenimiento></Add_Mantenimiento>} />
            <Route path="/editar_registro_mantenimiento/:id" element={<Edit_Mantenimiento></Edit_Mantenimiento>} />
            <Route path="/seguimientos" element={<Seguimientos></Seguimientos>} />
            {/* URL's de los reportes y gráficos */}
            <Route path="/reportes" element={<Reportes></Reportes>} />
            <Route path="/rendimiento_personal" element={<Rendimiento_Personal></Rendimiento_Personal>} />
            <Route path="/rendimiento_general" element={<Rendimiento_General></Rendimiento_General>} />
            <Route path="/grafica_pastel" element={<Chart_pie></Chart_pie>} />
            {/* URL's de áreas */}
            <Route path="/areas" element={<Areas></Areas>} />
            <Route path="/agregar_area" element={<Add_Area></Add_Area>} />
            <Route path="/editar_area/:id" element={<Edit_Area></Edit_Area>} />
            {/*  URL's de departamentos */}
            <Route path="/departamentos" element={<Departamento></Departamento>} />
            <Route path="/agregar_departamento" element={<Add_Departamento></Add_Departamento>} />
            <Route path="/editar_departamento/:id" element={<Edit_Departamento></Edit_Departamento>} />
            {/*  URL's de mantenimientos pendientes */}
            <Route path="/altas_pendientes" element={<Altas_Pendientes></Altas_Pendientes>} />
            {/*  URL's de atrasos */}
            <Route path="/agregar_atraso" element={<Add_Atraso></Add_Atraso>} />
            <Route path="/editar_atraso/:id" element={<Edit_Atraso></Edit_Atraso>} />
            <Route path="/mantenimientos_atrasados" element={<Atrasados></Atrasados>} />
            {/*  URL's de calificaciones */}
            <Route path="/calificaciones" element={<Calificaciones></Calificaciones>} />
            <Route path="/agregar_calificacion" element={<Calificaciones_Agregar></Calificaciones_Agregar>} />
            <Route path="/editar_calificacion/:id" element={<Calificaciones_Editar></Calificaciones_Editar>} />
            {/* Otros */}
            <Route path="/desempeños" element={<Desempeno></Desempeno>} />
            {/* URL's de perfil de usuario */}
            <Route path="/mi_perfil" element={<Mi_Perfil></Mi_Perfil>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;