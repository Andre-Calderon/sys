// Configuración centralizada de la API
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
};

// Variable global para la URL de la API
export const API_URL = API_CONFIG.baseURL;

// Función helper para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Función helper para hacer peticiones GET
export const apiGet = async (endpoint) => {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener datos de ${endpoint}`);
  }
  
  return response.json();
};

// Función helper para hacer peticiones POST
export const apiPost = async (endpoint, data) => {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error al enviar datos a ${endpoint}`);
  }
  
  return response.json();
};

// Función helper para hacer peticiones PUT
export const apiPut = async (endpoint, data) => {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error al actualizar datos en ${endpoint}`);
  }
  
  return response.json();
};

// Función helper para hacer peticiones DELETE
export const apiDelete = async (endpoint) => {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Error al eliminar datos en ${endpoint}`);
  }
  
  return response.json();
};

export default API_CONFIG;

