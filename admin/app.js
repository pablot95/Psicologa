// Credenciales (Básico - Lado del cliente)
const USER = "mililuena@yahoo.com.ar";
const PASS = "Mililuena1";

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir recarga del formulario
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === USER && password === PASS) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        initDashboard();
    } else {
        alert('Credenciales incorrectas');
    }
});

// Inicializar Dashboard
async function initDashboard() {
    await loadScheduleConfig();
    await loadAppointments();
}

// --- GESTIÓN DE HORARIOS ---
const daysMap = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
};

let currentSchedule = {};

async function loadScheduleConfig() {
    try {
        const docRef = window.firebaseDB.db.collection('config_gral').doc('horarios');
        const doc = await docRef.get();
        
        if (doc.exists) {
            currentSchedule = doc.data();
        } else {
            // Valores por defecto si no existe
            currentSchedule = {
                1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                5: ['09:00', '10:00', '11:00', '14:00', '15:00'],
                6: [], 0: []
            };
        }
        renderScheduleEditor();
    } catch (error) {
        console.error("Error cargando horarios:", error);
        alert("Error cargando configuración de horarios");
    }
}

function renderScheduleEditor() {
    const container = document.getElementById('scheduleEditor');
    container.innerHTML = '';

    // Ordenar días: Lunes (1) a Domingo (0)
    const order = [1, 2, 3, 4, 5, 6, 0];

    order.forEach(dayNum => {
        const hours = currentSchedule[dayNum] || [];
        // Ordenar horas
        hours.sort();

        const dayCard = document.createElement('div');
        dayCard.className = 'day-row';
        
        let hoursHtml = hours.map(h => `
            <span class="hour-tag">
                ${h} <span class="remove-hour" onclick="removeHour(${dayNum}, '${h}')">×</span>
            </span>
        `).join('');

        dayCard.innerHTML = `
            <div class="day-name">${daysMap[dayNum]}</div>
            <div class="hours-tags">${hoursHtml}</div>
            <div class="add-controls">
                <input type="time" id="newTime-${dayNum}">
                <button class="btn btn-success" onclick="addHour(${dayNum})">+</button>
            </div>
        `;
        container.appendChild(dayCard);
    });
}

window.addHour = async (dayNum) => {
    const timeInput = document.getElementById(`newTime-${dayNum}`);
    const time = timeInput.value;
    
    if (!time) return;
    
    if (!currentSchedule[dayNum]) currentSchedule[dayNum] = [];
    if (currentSchedule[dayNum].includes(time)) {
        alert('Ese horario ya existe');
        return;
    }

    currentSchedule[dayNum].push(time);
    await saveSchedule();
};

window.removeHour = async (dayNum, time) => {
    if (!confirm(`¿Eliminar horario ${time} del ${daysMap[dayNum]}?`)) return;
    
    currentSchedule[dayNum] = currentSchedule[dayNum].filter(h => h !== time);
    await saveSchedule();
};

async function saveSchedule() {
    try {
        await window.firebaseDB.db.collection('config_gral').doc('horarios').set(currentSchedule);
        renderScheduleEditor();
        // Feedback visual simple
        const btn = document.activeElement;
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = '✓';
            setTimeout(() => btn.innerText = originalText, 1000);
        }
    } catch (e) {
        console.error(e);
        alert('Error al guardar cambio');
    }
}

// --- GESTIÓN DE CITAS ---
async function loadAppointments() {
    const list = document.getElementById('appointmentsList');
    list.innerHTML = 'Cargando...';

    try {
        // Traer citas futuras (podrías filtrar por fecha aqui)
        const snapshot = await window.firebaseDB.appointmentsCollection
            .orderBy('date', 'desc')
            .orderBy('time', 'asc')
            .limit(50)
            .get();

        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = '<p>No hay citas registradas</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const date = new Date(data.date + 'T00:00:00'); // Fix timezone issue visually
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const item = document.createElement('div');
            item.className = 'appointment-item';
            item.innerHTML = `
                <div>
                    <strong>${dateStr} - ${data.time} hs</strong><br>
                    Paciente: ${data.clientName}<br>
                    <small>📞 ${data.clientPhone} | 📧 ${data.clientEmail}</small>
                </div>
                <button class="btn btn-danger" onclick="cancelAppointment('${id}')">Cancelar</button>
            `;
            list.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        list.innerHTML = 'Error cargando citas';
    }
}

window.cancelAppointment = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta cita? Esta acción liberará el turno.')) return;

    try {
        await window.firebaseDB.appointmentsCollection.doc(id).delete();
        loadAppointments();
        alert('Cita cancelada correctamente');
    } catch (e) {
        console.error(e);
        alert('Error al cancelar cita');
    }
};

document.getElementById('logoutBtn').addEventListener('click', () => {
    location.reload();
});
