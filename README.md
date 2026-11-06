# Aplicación de Reportes de Incidencias con Sincronización Offline

## Caso de Estudio
Desarrollar una aplicación móvil que permita registrar incidencias en lugares sin conexión a Internet, almacenando la información localmente y enviándola automáticamente a un servidor cuando se recupere la conectividad.

---

## Funcionalidades
- **Registro Completo:** Registrar incidencias con título, descripción, categoría, fotografía, ubicación GPS y fecha.
- **Gestión Offline:** Crear, editar y eliminar reportes sin conexión a Internet.
- **Almacenamiento Local Persistente:** Almacenar los reportes localmente mientras no exista conexión.
- **Detección de Red:** Detectar cambios en la conectividad de red y alcance del servidor.
- **Sincronización Automática:** Sincronizar automáticamente los reportes pendientes cuando exista conexión.
- **Estados en Tiempo Real:** Mostrar el estado de cada reporte: pendiente, sincronizando, sincronizado o error.
- **Cola de Procesamiento:** Implementar una cola FIFO para enviar múltiples reportes en orden sin duplicar datos.
- **Progreso y Reintentos:** Mostrar el progreso de sincronización y reintentar automáticamente los envíos fallidos.
- **Historial y Manual Sync:** Consultar el historial de reportes y sincronizar manualmente mediante un botón.
- **Marca Temporal:** Mostrar la fecha y hora de la última sincronización exitosa.

---

## Reglas Principales
- La aplicación funciona sin conexión para el registro y consulta de información almacenada.
- Los reportes se conservan aunque la aplicación se cierre o el dispositivo se reinicie.
- La sincronización se inicia automáticamente al detectar conexión disponible y acceso al servidor.
- Si la conexión se interrumpe durante un envío, los datos permanecen en la cola de reintentos.
- No se generan registros duplicados en el servidor durante los reintentos.
- Los reportes únicamente se me marcan como sincronizados tras la confirmación del servidor.

---

## Arquitectura Técnica
- **Frontend Móvil:** React Native con Expo & TypeScript.
- **Almacenamiento Local:** AsyncStorage (Persistencia Offline-First).
- **Controlador de Red & Queue Manager:** Motor FIFO en TypeScript con reintentos y verificador de disponibilidad REST API.
