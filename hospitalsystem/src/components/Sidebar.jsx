import React, { useState } from "react";
import { ExpandMore, ExpandLess, Dashboard, Settings, Info, 
  BarChart, TableView, Engineering, Apartment, AssuredWorkload, 
  Handyman, Assignment, Devices, PendingActions, Checklist, VerifiedUser, ManageHistory, Verified } from "@mui/icons-material";
import { List, ListItem, ListItemText, ListItemIcon, Collapse, Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/sidebar.css";

// ============================================
// OPCIONES MODULARES - Elige la que prefieras
// ============================================

// OPCIÓN A: Modular por categorías - Registros divididos en menús principales
const menuItems_OPCION_A = [
  // MÓDULO 0: Dashboard
  { type: "divider", label: "Inicio" },
  {
    text: "Dashboard",
    icon: <Dashboard style={{color:"var(--color-primary)"}} />, 
    path: "/Inicio",
    roles:["administrador","ingeniero"],
    module: "inicio"
  },
  // MÓDULO 1: Operaciones Activas
  { type: "divider", label: "Operaciones" },
  {
    text: "Seguimientos",
    icon: <Checklist style={{color:"var(--color-primary)"}} />, 
    path: "/seguimientos",
    roles:["administrador","ingeniero"],
    module: "operaciones"
  },
  {
    text: "Pendientes",
    icon: <PendingActions style={{color:"var(--color-primary)"}} />, 
    path: "/altas_pendientes",
    roles:["administrador","ingeniero"],
    module: "operaciones"
  },
  {
    text: "Atrasos",
    icon: <ManageHistory style={{color:"var(--color-primary)"}} />, 
    path: "/mantenimientos_atrasados",
    roles:["administrador","ingeniero"],
    module: "operaciones"
  },
  // MÓDULO 2: Gestión y Configuración - Dividido en menús principales
  { type: "divider", label: "Gestión" },
  {
    text: "Mantenimientos",
    icon: <Handyman style={{color:"var(--color-primary)"}} />, 
    path: "/registros_mantenimientos",
    roles:["administrador","ingeniero"],
    module: "gestion"
  },
  {
    text: "Equipos",
    icon: <Devices style={{color:"var(--color-primary)"}} />, 
    path: "/registros_equipos",
    roles:["administrador"],
    module: "gestion"
  },
  {
    text: "Organización",
    icon: <Apartment style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Departamentos", icon: <Apartment style={{color:"var(--color-secondary)"}} />,  path:"/departamentos", roles:["administrador"] },
      { text: "Áreas Específicas", icon: <AssuredWorkload style={{color:"var(--color-secondary)"}} />,  path:"/areas", roles:["administrador"] },
    ],
    module: "gestion"
  },
  {
    text: "Usuarios",
    icon: <Engineering style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Ingenieros", icon: <Engineering style={{color:"var(--color-secondary)"}} />,  path:"/registro_ingenieros", roles:["administrador"] },
      { text: "Administradores", icon: <VerifiedUser style={{color:"var(--color-secondary)"}} />,  path:"/registro_administradores", roles:["administrador"] },
    ],
    module: "gestion"
  },
  // MÓDULO 3: Evaluación
  { type: "divider", label: "Evaluación" },
  {
    text: "Calificaciones",
    icon: <Verified style={{color:"var(--color-primary)"}} />, 
    path: "/calificaciones",
    roles:["administrador","ingeniero"],
    module: "evaluacion"
  },
];

// OPCIÓN B: Modular por prioridad - Registros divididos en menús principales
const menuItems_OPCION_B = [
  // MÓDULO 1: Urgente (alta prioridad)
  { type: "section", label: "Urgente" },
  {
    text: "Atrasos",
    icon: <ManageHistory style={{color:"var(--color-primary)"}} />, 
    path: "/mantenimientos_atrasados",
    roles:["administrador","ingeniero"],
    priority: "urgente"
  },
  {
    text: "Pendientes",
    icon: <PendingActions style={{color:"var(--color-primary)"}} />, 
    path: "/altas_pendientes",
    roles:["administrador","ingeniero"],
    priority: "urgente"
  },
  // MÓDULO 2: Activo (monitoreo)
  { type: "section", label: "En Proceso" },
  {
    text: "Seguimientos",
    icon: <Checklist style={{color:"var(--color-primary)"}} />, 
    path: "/seguimientos",
    roles:["administrador","ingeniero"],
    priority: "activo"
  },
  // MÓDULO 3: Configuración - Dividido en menús principales
  { type: "section", label: "Configuración" },
  {
    text: "Mantenimientos",
    icon: <Handyman style={{color:"var(--color-primary)"}} />, 
    path: "/registros_mantenimientos",
    roles:["administrador","ingeniero"],
    priority: "configuracion"
  },
  {
    text: "Equipos",
    icon: <Devices style={{color:"var(--color-primary)"}} />, 
    path: "/registros_equipos",
    roles:["administrador"],
    priority: "configuracion"
  },
  {
    text: "Organización",
    icon: <Apartment style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Departamentos", icon: <Apartment style={{color:"var(--color-secondary)"}} />,  path:"/departamentos", roles:["administrador"] },
      { text: "Áreas Específicas", icon: <AssuredWorkload style={{color:"var(--color-secondary)"}} />,  path:"/areas", roles:["administrador"] },
    ],
    priority: "configuracion"
  },
  {
    text: "Usuarios",
    icon: <Engineering style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Ingenieros", icon: <Engineering style={{color:"var(--color-secondary)"}} />,  path:"/registro_ingenieros", roles:["administrador"] },
      { text: "Administradores", icon: <VerifiedUser style={{color:"var(--color-secondary)"}} />,  path:"/registro_administradores", roles:["administrador"] },
    ],
    priority: "configuracion"
  },
  // MÓDULO 4: Evaluación
  { type: "section", label: "Evaluación" },
  {
    text: "Calificaciones",
    icon: <Verified style={{color:"var(--color-primary)"}} />, 
    path: "/calificaciones",
    roles:["administrador","ingeniero"],
    priority: "evaluacion"
  },
];

// OPCIÓN C: Modular por flujo de trabajo - Registros divididos
const menuItems_OPCION_C = [
  // MÓDULO 1: Inicio del proceso
  { type: "section", label: "Planificación" },
  {
    text: "Mantenimientos",
    icon: <Handyman style={{color:"var(--color-primary)"}} />, 
    path: "/registros_mantenimientos",
    roles:["administrador","ingeniero"],
    flow: "planificacion"
  },
  {
    text: "Equipos",
    icon: <Devices style={{color:"var(--color-primary)"}} />, 
    path: "/registros_equipos",
    roles:["administrador"],
    flow: "planificacion"
  },
  {
    text: "Organización",
    icon: <Apartment style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Departamentos", icon: <Apartment style={{color:"var(--color-secondary)"}} />,  path:"/departamentos", roles:["administrador"] },
      { text: "Áreas Específicas", icon: <AssuredWorkload style={{color:"var(--color-secondary)"}} />,  path:"/areas", roles:["administrador"] },
    ],
    flow: "planificacion"
  },
  {
    text: "Usuarios",
    icon: <Engineering style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Ingenieros", icon: <Engineering style={{color:"var(--color-secondary)"}} />,  path:"/registro_ingenieros", roles:["administrador"] },
      { text: "Administradores", icon: <VerifiedUser style={{color:"var(--color-secondary)"}} />,  path:"/registro_administradores", roles:["administrador"] },
    ],
    flow: "planificacion"
  },
  // MÓDULO 2: Ejecución
  { type: "section", label: "Ejecución" },
  {
    text: "Pendientes",
    icon: <PendingActions style={{color:"var(--color-primary)"}} />, 
    path: "/altas_pendientes",
    roles:["administrador","ingeniero"],
    flow: "ejecucion"
  },
  {
    text: "Seguimientos",
    icon: <Checklist style={{color:"var(--color-primary)"}} />, 
    path: "/seguimientos",
    roles:["administrador","ingeniero"],
    flow: "ejecucion"
  },
  {
    text: "Atrasos",
    icon: <ManageHistory style={{color:"var(--color-primary)"}} />, 
    path: "/mantenimientos_atrasados",
    roles:["administrador","ingeniero"],
    flow: "ejecucion"
  },
  // MÓDULO 3: Control
  { type: "section", label: "Control" },
  {
    text: "Calificaciones",
    icon: <Verified style={{color:"var(--color-primary)"}} />, 
    path: "/calificaciones",
    roles:["administrador","ingeniero"],
    flow: "control"
  },
];

// OPCIÓN D: Modular simple - Registros divididos en menús principales
const menuItems_OPCION_D = [
  // Grupo 1: Tareas operativas
  {
    text: "Pendientes",
    icon: <PendingActions style={{color:"var(--color-primary)"}} />, 
    path: "/altas_pendientes",
    roles:["administrador","ingeniero"]
  },
  {
    text: "Atrasos",
    icon: <ManageHistory style={{color:"var(--color-primary)"}} />, 
    path: "/mantenimientos_atrasados",
    roles:["administrador","ingeniero"]
  },
  {
    text: "Seguimientos",
    icon: <Checklist style={{color:"var(--color-primary)"}} />, 
    path: "/seguimientos",
    roles:["administrador","ingeniero"]
  },
  // Grupo 2: Gestión - Dividido en menús principales
  {
    text: "Mantenimientos",
    icon: <Handyman style={{color:"var(--color-primary)"}} />, 
    path: "/registros_mantenimientos",
    roles:["administrador","ingeniero"]
  },
  {
    text: "Equipos",
    icon: <Devices style={{color:"var(--color-primary)"}} />, 
    path: "/registros_equipos",
    roles:["administrador"]
  },
  {
    text: "Organización",
    icon: <Apartment style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Departamentos", icon: <Apartment style={{color:"var(--color-secondary)"}} />,  path:"/departamentos", roles:["administrador"] },
      { text: "Áreas Específicas", icon: <AssuredWorkload style={{color:"var(--color-secondary)"}} />,  path:"/areas", roles:["administrador"] },
    ],
  },
  {
    text: "Usuarios",
    icon: <Engineering style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Ingenieros", icon: <Engineering style={{color:"var(--color-secondary)"}} />,  path:"/registro_ingenieros", roles:["administrador"] },
      { text: "Administradores", icon: <VerifiedUser style={{color:"var(--color-secondary)"}} />,  path:"/registro_administradores", roles:["administrador"] },
    ],
  },
  // Grupo 3: Evaluación
  {
    text: "Calificaciones",
    icon: <Verified style={{color:"var(--color-primary)"}} />, 
    path: "/calificaciones",
    roles:["administrador","ingeniero"]
  },
];

// ============================================
// SELECCIONA LA OPCIÓN QUE DESEAS USAR
// Cambia menuItems_OPCION_X por la opción que prefieras (A, B, C o D)
// ============================================
const menuItems = menuItems_OPCION_A; // Cambia aquí: A, B, C o D

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState({});
  const { user } = useAuth();
  const role = user?.role;

  const handleToggle = (index) => {
    setOpenMenu((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(role));
  let itemIndex = 0;

  return (
    <div className="sidebar">
      <div className="tittle_seccion">
        <h5>Gestión de mantenimientos</h5>
      </div>
      <List>
        {filteredItems.map((item, index) => {
          // Manejar separadores y títulos de sección
          if (item.type === "divider" || item.type === "section") {
            return (
              <React.Fragment key={`divider-${index}`}>
                <Divider sx={{ my: 1, mx: 2 }} />
                {item.label && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 2, 
                      py: 1, 
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </React.Fragment>
            );
          }

          // Items normales del menú
          const currentIndex = itemIndex++;
          return (
            <div key={index}>
              <ListItem 
                button 
                component={item.path ? Link : "div"}
                to={item.path || "#"} 
                onClick={() => item.subMenu && handleToggle(currentIndex)} 
                className="menu-item"
                sx={{ 
                  "&:hover": { 
                    backgroundColor: "rgba(102, 29, 117, 0.08)",
                    borderRadius: "8px"
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subMenu ? (openMenu[currentIndex] ? <ExpandLess /> : <ExpandMore />) : null}
              </ListItem>
              {item.subMenu && (
                <Collapse in={openMenu[currentIndex]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className="submenu-container">
                    {item.subMenu
                      .filter(sub => !sub.roles || sub.roles.includes(role))
                      .map((sub, subIndex) => (
                        <ListItem 
                          button 
                          component={Link} 
                          to={sub.path || "#"} 
                          key={subIndex} 
                          className="submenu-item"
                        >
                          <ListItemIcon>{sub.icon}</ListItemIcon>
                          <ListItemText primary={sub.text} />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
    </div>
  );
};

export default Sidebar;
