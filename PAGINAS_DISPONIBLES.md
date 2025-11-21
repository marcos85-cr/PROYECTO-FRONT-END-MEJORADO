# 📋 Páginas Disponibles en la Aplicación

## 🔐 Autenticación
- **Login**: `/login` - Página de inicio de sesión
- **Registro**: `/register` - Página de registro de nuevos usuarios

## 👤 Cliente (Requiere rol: Cliente)
### Tabs del Cliente: `/tabs`
- **Home**: `/tabs/home` - Página principal del cliente
- **Tarjeta**: `/tabs/card` - Información de tarjetas
- **Transacciones**: `/tabs/transactions` - Historial de transacciones
- **Configuración**: `/tabs/settings` - Configuración del cliente

### Funcionalidades Adicionales del Cliente: `/cliente`
- **Transferencias**: `/cliente/transfer` - Realizar transferencias
- **Beneficiarios**: `/cliente/beneficiaries` - Gestión de beneficiarios
- **Pagos**: `/cliente/payments` - Realizar pagos
- **Historial**: `/cliente/history` - Historial detallado

## 👔 Gestor (Requiere rol: Gestor)
Ruta base: `/gestor`
- **Dashboard**: `/gestor/dashboard` - Panel principal del gestor
- **Clientes**: `/gestor/clients` - Gestión de clientes
- **Operaciones**: `/gestor/operations` - Gestión de operaciones

## 🛠️ Administrador (Requiere rol: Administrador)
Ruta base: `/admin`
- **Dashboard**: `/admin/dashboard` - Panel principal del administrador
- **Usuarios**: `/admin/users` - Gestión de usuarios
- **Cuentas**: `/admin/accounts` - Gestión de cuentas
- **Reportes**: `/admin/reports` - Generación de reportes

## 🔒 Protección de Rutas
Todas las rutas están protegidas por:
- **AuthGuard**: Requiere autenticación
- **RoleGuard**: Requiere roles específicos

## 📱 Navegación Recomendada
1. Inicia en `/login`
2. Según tu rol, serás redirigido a:
   - Cliente → `/tabs/home`
   - Gestor → `/gestor/dashboard`
   - Administrador → `/admin/dashboard`

## 🚀 Para Acceder - MODO LIBRE 🔓
1. Ejecuta: `ionic serve`
2. Abre tu navegador en: `http://localhost:8102`
3. **ACCESO AUTOMÁTICO:** Serás redirigido al navegador de páginas
4. **Todas las páginas están disponibles sin autenticación**

### 📱 Enlaces Directos:
- **Usuarios de Prueba**: `http://localhost:8102/test-users`
- **Login**: `http://localhost:8102/login`
- **Cualquier página**: Acceso directo sin restricciones