// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referencia a la colección de citas
const appointmentsCollection = db.collection('appointments');

// Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tu configuración de EmailJS
const emailjsConfig = {
    publicKey: "TU_PUBLIC_KEY",
    serviceId: "TU_SERVICE_ID",
    templateClientId: "template_cliente", // Template para el cliente
    templatePsychologistId: "template_psicologa" // Template para la psicóloga
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
