import React, { useState } from "react";
import { ExpandMore, ExpandLess, Dashboard, Settings, Info, 
  BarChart, TableView, Engineering, Apartment, AssuredWorkload, 
  Handyman, Assignment, Devices, PendingActions, Checklist, VerifiedUser, ManageHistory, Verified } from "@mui/icons-material";
import { List, ListItem, ListItemText, ListItemIcon, Collapse, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/sidebar.css";

const menuItems = [
  {
    text: "Registros",
    icon: <TableView style={{color:"var(--color-primary)"}} />, 
    subMenu: [
      { text: "Mantenimientos", icon: <Handyman style={{color:"var(--color-secondary)"}} />, path:"/registros_mantenimientos", roles:["administrador","ingeniero"] },
      { text: "Gestión de equipos", icon: <Devices style={{color:"var(--color-secondary)"}} />, path:"/registros_equipos", roles:["administrador"] },
      { text: "Departamentos", icon: <Apartment style={{color:"var(--color-secondary)"}} />,  path:"/departamentos", roles:["administrador"] },
      { text: "Áreas", icon: <AssuredWorkload style={{color:"var(--color-secondary)"}} />,  path:"/areas", roles:["administrador"] },
      { text: "Ingenieros", icon: <Engineering style={{color:"var(--color-secondary)"}} />,  path:"/registro_ingenieros", roles:["administrador"] },
      { text: "Administradores", icon: <VerifiedUser style={{color:"var(--color-secondary)"}} />,  path:"/registro_administradores", roles:["administrador"] },
    ],
  },
  {
    text: "Seguimientos",
    icon: <Checklist style={{color:"var(--color-primary)"}} />, 
    path: "/seguimientos",
    roles:["administrador","ingeniero"]
  },
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
    text: "Calificaciones",
    icon: <Verified style={{color:"var(--color-primary)"}} />, 
    path: "/calificaciones",
    roles:["administrador","ingeniero"]
  },
  // {
  //   text: "Reportes",
  //   icon: <BarChart style={{color:"var(--color-primary)"}} />, 
  //   path: "#",
  //   roles:["administrador"]
  // },
  // {
  //   text: "Desempeños",
  //   icon: <Assignment style={{color:"var(--color-primary)"}} />, 
  //   path: "/desempeños",
  //   roles:["administrador"]
  // },
];

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState({});
  const { user } = useAuth();
  const role = user?.role;

  const handleToggle = (index) => {
    setOpenMenu((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="sidebar">
      <div className="tittle_seccion">
        <h5>Gestión de mantenimientos</h5>
      </div>
      <List>
        {menuItems
          .filter(item => !item.roles || item.roles.includes(role)) // filtro por rol
          .map((item, index) => (
          <div key={index}>
            <ListItem 
              button 
              component={Link} 
              to={item.path || "#"} 
              onClick={() => handleToggle(index)} 
              className="menu-item"
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subMenu ? (openMenu[index] ? <ExpandLess /> : <ExpandMore />) : null}
            </ListItem>
            {item.subMenu && (
              <Collapse in={openMenu[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding className="submenu-container">
                  {item.subMenu
                    .filter(sub => !sub.roles || sub.roles.includes(role)) // filtro por rol
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
        ))}
      </List>
    </div>
  );
};

export default Sidebar;