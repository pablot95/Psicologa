# Sistema de Reserva de Citas - Psicología | Lic. MM Luena

## Sitio Web Optimizado para SEO

Este sitio web profesional para servicios de psicología está optimizado para aparecer en búsquedas de:
- **Psicóloga** / **Psicología**
- **Psicóloga Mar del Plata**
- **Psicóloga virtual** / **Psicóloga online**
- **Terapia online** / **Consulta psicológica virtual**

### Optimizaciones SEO Implementadas:

✅ **Meta Tags completos** con palabras clave principales  
✅ **Schema Markup (JSON-LD)** para Google Rich Snippets  
✅ **Geo-localización** específica de Mar del Plata  
✅ **Contenido optimizado** con keywords naturales  
✅ **Alt text descriptivo** en todas las imágenes  
✅ **robots.txt y sitemap.xml** configurados  
✅ **Open Graph tags** para redes sociales  

### Próximos Pasos Recomendados para Mejorar Posicionamiento:

1. **Google My Business** - Crear perfil para Mar del Plata
2. **Content Marketing** - Blog con artículos sobre salud mental
3. **Backlinks** - Registrar en directorios de psicólogos
4. **Velocidad** - Optimizar y comprimir imágenes
5. **Analytics** - Instalar Google Analytics y Search Console

---

## Configuración de Firebase

Para que el sistema de reservas funcione correctamente, necesitas configurar Firebase:

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Sigue los pasos para crear tu proyecto

### 2. Habilitar Firestore Database

1. En el menú lateral, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba" (luego puedes cambiar las reglas de seguridad)
4. Elige la ubicación más cercana a Argentina (southamerica-east1)

### 3. Obtener la configuración del proyecto

1. Ve a Configuración del proyecto (ícono de engranaje)
2. En la sección "Tus apps", selecciona "Web" (</> icono)
3. Registra la app con un nombre (ej: "Psicologa Web")
4. Copia la configuración de Firebase

### 4. Configurar el archivo firebase-config.js

Abre el archivo `firebase-config.js` y reemplaza los valores con tu configuración:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};
```

## Configuración de Google Calendar (Opcional pero Recomendado)

**IMPORTANTE**: Google Calendar funciona con CUALQUIER email, incluido Yahoo. No necesitas cambiar tu email.

### Opción A: Enlace Simple (Ya implementado)
El sistema actual genera un enlace para que agregues manualmente cada cita a tu Google Calendar. Funciona con cualquier cuenta de Google.

### Opción B: Integración Automática con Google Calendar API (Recomendado)

Para que las citas se agreguen automáticamente a tu Google Calendar:

1. **Habilitar Google Calendar API**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea o selecciona un proyecto
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API" y habilítala
   - Ve a "Credentials" > "Create Credentials" > "API Key"
   - Copia la API Key

2. **Configurar OAuth 2.0** (para acceso completo):
   - En la misma sección de Credentials
   - "Create Credentials" > "OAuth client ID"
   - Tipo: "Web application"
   - Agrega tu dominio en "Authorized JavaScript origins"
   - Copia el Client ID

3. **Agregar credenciales en firebase-config.js**:
```javascript
// Agregar después de firebaseConfig
const googleCalendarConfig = {
    apiKey: "TU_GOOGLE_API_KEY",
    clientId: "TU_CLIENT_ID.apps.googleusercontent.com",
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: "https://www.googleapis.com/auth/calendar.events"
};
```

4. **Tu cuenta de Google**:
   - Puedes usar tu email de Yahoo para crear una cuenta de Google
   - O vincular tu Yahoo mail a Google Calendar
   - Ir a [calendar.google.com](https://calendar.google.com)
   - Iniciar sesión (puedes usar tu email de Yahoo)

## Configuración de EmailJS (Recomendado)

**EmailJS permite enviar correos automáticos sin servidor backend**. Se enviarán 2 emails por cada cita:
1. Email de confirmación al cliente
2. Email de notificación a la psicóloga

### Pasos para configurar EmailJS:

1. **Crear cuenta en EmailJS**:
   - Ve a [emailjs.com](https://www.emailjs.com/)
   - Regístrate gratis (100 emails/mes incluidos)
   - Verifica tu email

2. **Conectar tu servicio de email**:
   - En el dashboard, ve a "Email Services"
   - Click en "Add New Service"
   - Selecciona tu proveedor (Gmail, Yahoo, Outlook, etc.)
   - Para Yahoo: selecciona "Yahoo" y sigue las instrucciones
   - Conecta tu cuenta: milluena@yahoo.com.ar
   - Copia el **Service ID** (ej: service_abc123)

3. **Crear Templates de Email**:

   **Template 1: Para el Cliente**
   - Ve a "Email Templates" > "Create New Template"
   - Nombre: "Confirmación de Cita - Cliente"
   - Template ID: `template_cliente`
   - Contenido sugerido:

   ```
   Asunto: Confirmación de tu cita - Psicología

   Hola {{to_name}},

   ¡Tu cita ha sido confirmada!

   📅 Fecha: {{appointment_date}}
   🕐 Hora: {{appointment_time}}
   📞 Teléfono: {{client_phone}}
   
   📝 Notas: {{notes}}

   Datos de contacto:
   {{psychologist_name}}
   Teléfono: {{psychologist_phone}}
   Email: milluena@yahoo.com.ar

   Por favor, llega 5 minutos antes de tu cita.

   Si necesitas cancelar o reprogramar, contáctanos con al menos 24hs de anticipación.

   ¡Te esperamos!

   ---
   Lic. MM Luena - MP 47861
   Servicios de Psicología y Neuropsicología
   ```

   **Template 2: Para la Psicóloga**
   - Crear otro template
   - Nombre: "Nueva Cita Agendada - Notificación"
   - Template ID: `template_psicologa`
   - Contenido sugerido:

   ```
   Asunto: Nueva cita agendada

   Nueva cita registrada en el sistema:

   👤 Cliente: {{client_name}}
   📧 Email: {{client_email}}
   📞 Teléfono: {{client_phone}}
   
   📅 Fecha: {{appointment_date}}
   🕐 Hora: {{appointment_time}}
   
   📝 Motivo de consulta:
   {{notes}}

   ---
   Sistema de Reservas Online
   ```

4. **Obtener credenciales**:
   - Ve a "Account" > "General"
   - Copia tu **Public Key** (ej: user_abc123xyz)

5. **Configurar en firebase-config.js**:
   - Abre el archivo `firebase-config.js`
   - Reemplaza los valores:

   ```javascript
   const emailjsConfig = {
       publicKey: "TU_PUBLIC_KEY_AQUI",      // De Account > General
       serviceId: "TU_SERVICE_ID_AQUI",      // De Email Services
       templateClientId: "template_cliente",  // ID del template del cliente
       templatePsychologistId: "template_psicologa" // ID del template de la psicóloga
   };
   ```

### Ejemplo de configuración completa:

```javascript
const emailjsConfig = {
    publicKey: "user_K7mXyZ3aBcDeFgHi",
    serviceId: "service_yahoo_mlluena",
    templateClientId: "template_cliente",
    templatePsychologistId: "template_psicologa"
};
```

### Personalizar emails:

Los templates de EmailJS soportan variables dinámicas:
- `{{to_name}}` - Nombre del cliente
- `{{appointment_date}}` - Fecha formateada
- `{{appointment_time}}` - Hora de la cita
- `{{notes}}` - Notas del cliente
- Puedes agregar más variables según necesites

### 5. Configurar reglas de seguridad de Firestore

En Firebase Console > Firestore Database > Reglas, actualiza las reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appointments/{appointment} {
      // Permitir lectura de todas las citas
      allow read: if true;
      
      // Permitir crear nuevas citas
      allow create: if true;
      
      // Solo administradores pueden actualizar o eliminar
      allow update, delete: if false;
    }
  }
}
```

**Nota de seguridad**: Estas reglas son básicas. Para producción, debes implementar autenticación y reglas más estrictas.

### 6. Estructura de datos en Firestore

Las citas se guardan en la colección `appointments` con la siguiente estructura:

```javascript
{
  date: "2026-01-28",           // Fecha en formato YYYY-MM-DD
  time: "10:00",                // Hora en formato HH:MM
  clientName: "Nombre Apellido",
  clientEmail: "email@example.com",
  clientPhone: "+542235126815",
  notes: "Motivo de consulta",
  createdAt: timestamp,         // Timestamp de Firebase
  status: "confirmed"           // Estado de la cita
}
```

## Funcionalidades Implementadas

### ✅ Sistema de Calendario
- Visualización mensual con navegación
- Días deshabilitados (pasados y sin horarios)
- Selección visual de fecha
- Marca del día actual

### ✅ Horarios Disponibles
- Horarios personalizables por día de la semana
- Visualización de slots disponibles
- Deshabilitación automática de horarios reservados
- Selección visual de horario

### ✅ Formulario de Reserva
- Validación de campos
- Campos: nombre, email, teléfono, notas
- Confirmación en Firebase

### ✅ Sistema de Emails Automáticos (EmailJS)
- Email de confirmación al cliente con todos los detalles
- Email de notificación a la psicóloga
- Templates personalizables
- Sin necesidad de servidor backend
- Funciona con cualquier proveedor de email (Gmail, Yahoo, Outlook, etc.)

### ✅ Integración con WhatsApp
- Botón de contacto en el hero
- Enlace en el footer
- Opción de mensaje de confirmación

### ⚠️ Google Calendar (Opcional)
- Generación de URL para agregar evento manualmente
- No requiere API ni configuración adicional
- El usuario puede agregar la cita a su calendario con un click

## Personalización de Horarios

Edita el objeto `availableHours` en `script.js`:

```javascript
const availableHours = {
    1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Lunes
    2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Martes
    3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Miércoles
    4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Jueves
    5: ['09:00', '10:00', '11:00', '14:00', '15:00'], // Viernes
    6: [], // Sábado - no disponible
    0: []  // Domingo - no disponible
};
```

## Testing Local

1. Asegúrate de tener configurado Firebase
2. Abre `index.html` en un navegador moderno
3. El sistema cargará las citas existentes de Firebase
4. Prueba seleccionando una fecha y horario
5. Completa el formulario y confirma

## Deployment

### Opción 1: Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init hosting

# Seleccionar el proyecto
# Establecer el directorio público como la carpeta actual

# Desplegar
firebase deploy
```

### Opción 2: GitHub Pages

1. Sube los archivos a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main y carpeta root
4. Guarda y espera el deployment

### Opción 3: Netlify

1. Arrastra la carpeta a [Netlify Drop](https://app.netlify.com/drop)
2. Listo, tu sitio estará en línea

## Próximas Mejoras Sugeridas

- [ ] Panel de administración para gestionar citas
- [ ] Recordatorios automáticos por email 24hs antes
- [ ] Sistema de cancelación de citas
- [ ] Autenticación de usuarios
- [ ] Historial de citas
- [ ] Estadísticas y reportes
- [ ] Videollamadas integradas
- [ ] Pagos online
- [ ] Sincronización bidireccional con Google Calendar (API)

## Soporte

Para cualquier consulta o problema:
- Email: milluena@yahoo.com.ar
- WhatsApp: +54 223 5 126 815

---

**Desarrollado con 💙 para Lic. MM Luena**
