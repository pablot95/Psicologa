const firebaseConfig = {
    apiKey: "AIzaSyDBazSiSwuO2eMPWW4X0MQ7olKlulboeC4",
    authDomain: "mariadelosmilagros-8c2e6.firebaseapp.com",
    projectId: "mariadelosmilagros-8c2e6",
    storageBucket: "mariadelosmilagros-8c2e6.firebasestorage.app",
    messagingSenderId: "127795164134",
    appId: "1:127795164134:web:4218bf7f24e86978e79c27"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const appointmentsCollection = db.collection('appointments');

const emailjsConfig = {
    publicKey: "YVBulg3By7Z4rFbWZ",
    serviceId: "service_09wfwoq",
    templateClientId: "template_norlx65",
    templatePsychologistId: "template_lwscxqp"
};

(function() {
    emailjs.init(emailjsConfig.publicKey);
})();

window.firebaseDB = {
    db,
    appointmentsCollection
};

window.emailjsConfig = emailjsConfig;
