# 👥 Usuarios de Prueba Disponibles

## 🔐 Credenciales de Acceso
**Contraseña para todos los usuarios:** `123456`

---

## 🛠️ **Administrador**
- **Email:** `admin@banco.com`
- **Contraseña:** `123456`
- **Nombre:** Administrador Sistema
- **Rol:** Administrador
- **Acceso a:** 
  - Dashboard administrativo
  - Gestión de usuarios
  - Gestión de cuentas  
  - Reportes del sistema

---

## 👔 **Gestor Bancario**
- **Email:** `gestor@banco.com`
- **Contraseña:** `123456`
- **Nombre:** María González
- **Rol:** Gestor
- **Acceso a:**
  - Dashboard del gestor
  - Gestión de clientes
  - Operaciones bancarias

---

## 👤 **Clientes**

### Cliente Principal
- **Email:** `cliente@banco.com`
- **Contraseña:** `123456`
- **Nombre:** Marcos Vargas
- **Rol:** Cliente
- **Identificación:** 456789123
- **Teléfono:** +506 6666-6666

### Cliente Adicional 1
- **Email:** `juan.perez@email.com`
- **Contraseña:** `123456`
- **Nombre:** Juan Pérez
- **Rol:** Cliente
- **Identificación:** 111222333
- **Teléfono:** +506 5555-5555

### Cliente Adicional 2
- **Email:** `maria.lopez@email.com`
- **Contraseña:** `123456`
- **Nombre:** María López
- **Rol:** Cliente  
- **Identificación:** 444555666
- **Teléfono:** +506 4444-4444

---

## 🚀 **Cómo Acceder**

1. **Inicia la aplicación:** `http://localhost:8102`
2. **Ve a la página de login:** `/login`
3. **Usa cualquiera de los emails y la contraseña:** `123456`
4. **Serás redirigido automáticamente según tu rol:**
   - **Administrador** → `/admin/dashboard`
   - **Gestor** → `/gestor/dashboard`  
   - **Cliente** → `/tabs/home`

---

## 📱 **Funcionalidades por Rol**

### 🛠️ Administrador
- ✅ Dashboard completo del sistema
- ✅ Gestión de todos los usuarios
- ✅ Administración de cuentas bancarias
- ✅ Generación de reportes

### 👔 Gestor
- ✅ Panel de control del gestor
- ✅ Listado y gestión de clientes
- ✅ Supervisión de operaciones

### 👤 Cliente
- ✅ Dashboard personal con balance
- ✅ Información de tarjetas
- ✅ Historial de transacciones
- ✅ Realizar transferencias
- ✅ Gestionar beneficiarios
- ✅ Realizar pagos
- ✅ Configuración de cuenta

---

## 🔧 **Nota Técnica**
La aplicación está configurada para usar un **servicio mock** que simula un backend real. Esto significa que:
- ✅ No necesitas un servidor backend funcionando
- ✅ Los datos están hardcodeados para pruebas
- ✅ Puedes probar todas las funcionalidades inmediatamente
- ⚠️ Los datos no se persisten entre recargas de página

Para usar un backend real, cambia `useMockService = false` en el archivo `auth.service.ts`.