// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDBazSiSwuO2eMPWW4X0MQ7olKlulboeC4",
    authDomain: "mariadelosmilagros-8c2e6.firebaseapp.com",
    projectId: "mariadelosmilagros-8c2e6",
    storageBucket: "mariadelosmilagros-8c2e6.firebasestorage.app",
    messagingSenderId: "127795164134",
    appId: "1:127795164134:web:4218bf7f24e86978e79c27"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referencia a la colección de citas
const appointmentsCollection = db.collection('appointments');

// Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tu configuración de EmailJS
const emailjsConfig = {
    publicKey: "YVBulg3By7Z4rFbWZ", // Pega aquí tu Public Key de la sección "Account"
    serviceId: "service_09wfwoq", // Pega aquí el ID del servicio SMTP de Hostinger (ej: service_xxxxx)
    templateClientId: "template_norlx65", // Template para el cliente
    templatePsychologistId: "template_lwscxqp" // Template para la psicóloga
};

// Inicializar EmailJS
(function() {
    emailjs.init(emailjsConfig.publicKey);
})();

// Exportar para usar en otros archivos
window.firebaseDB = {
    db,
    appointmentsCollection
};

window.emailjsConfig = emailjsConfig;
