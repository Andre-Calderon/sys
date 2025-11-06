# Configuración del Entorno - Hospital System

## 📋 Requisitos Previos

- Node.js instalado
- Backend Laravel corriendo en local
- Base de datos configurada

## 🔧 Configuración del Backend Laravel

Asegúrate de que tu backend Laravel esté corriendo. Por defecto Laravel corre en el puerto 8000:

```bash
php artisan serve
```

El servidor debería estar corriendo en: `http://localhost:8000`

## 🌐 Configuración del Frontend React

### 1. Archivo de Variables de Entorno

El proyecto ya incluye un archivo `.env` configurado para apuntar al backend local:

```env
# URL del backend API Laravel local
REACT_APP_API_URL=http://localhost:8000/api
```

### 2. Si tu backend corre en un puerto diferente

Si tu backend Laravel corre en un puerto diferente al 8000, edita el archivo `.env` y cambia la URL:

```env
REACT_APP_API_URL=http://localhost:PUERTO/api
```

Reemplaza `PUERTO` con el puerto que estés usando.

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm start
```

El frontend debería abrirse automáticamente en `http://localhost:3000`

## 📝 Notas Importantes

- **El proyecto SOLO usará la URL definida en el `.env`** - NO hay fallback a producción
- **Después de cambiar el archivo `.env`**, debes **reiniciar el servidor de desarrollo** (detener y volver a ejecutar `npm start`)
- El archivo `.env` no se subirá al repositorio (está en `.gitignore`)
- Si trabajas en equipo, comparte el archivo `.env.example` y cada desarrollador debe crear su propio `.env`
- **IMPORTANTE**: Si no existe el archivo `.env` o está mal configurado, las llamadas API fallarán

## 🔄 Cambiar entre Entornos

### Para desarrollo local:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Para producción (Render):
```env
REACT_APP_API_URL=https://biomedcontrol-api.onrender.com/api
```

**Nota**: Todas las URLs hardcodeadas han sido eliminadas del código. El proyecto depende 100% del archivo `.env`

## 🐛 Solución de Problemas

### Error de CORS
Si obtienes errores de CORS, asegúrate de que tu backend Laravel tenga configurado correctamente el middleware CORS:

En `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000'],
```

### Error 404 en las rutas
Verifica que tus rutas en el backend tengan el prefijo `/api`:

En `routes/api.php` de Laravel, las rutas deberían ser:
```php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/dispositivos', [DispositivosController::class, 'index']);
// etc...
```

## 📚 Archivos Actualizados

Los siguientes archivos han sido actualizados para usar la variable de entorno:

- ✅ `src/context/AuthContext.js`
- ✅ `src/pages/Login/index.jsx`
- ✅ `src/pages/Dashboard.jsx`
- ✅ `src/config/api.js` (nuevo archivo con helpers)

## 🚀 Próximos Pasos

Para actualizar otros componentes que hagan llamadas al API, **importa la configuración centralizada**:

```javascript
// Al inicio del archivo
import { API_URL } from '../config/api';

// En las llamadas fetch
const response = await fetch(`${API_URL}/tu-endpoint`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
```

**NO uses URLs hardcodeadas ni agregues fallbacks**. Todo se gestiona desde `src/config/api.js`

O puedes usar los helpers del archivo `src/config/api.js`:

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from '../config/api';

// Ejemplo de uso
const data = await apiGet('/dispositivos');
const result = await apiPost('/dispositivos', { nombre: 'Nuevo' });
```

