// Configuración del calendario y reservas
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let bookedAppointments = [];

// Horarios disponibles predeterminados (se sobrescriben desde Firebase)
let availableHours = {
    1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Lunes
    2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Martes
    3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Miércoles
    4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Jueves
    5: ['09:00', '10:00', '11:00', '14:00', '15:00'], // Viernes
    6: [], // Sábado - no disponible
    0: []  // Domingo - no disponible
};

// Cargar disponibilidad desde Firebase
async function loadAvailability() {
    try {
        const docRef = window.firebaseDB.db.collection('config_gral').doc('horarios');
        const doc = await docRef.get();
        if (doc.exists) {
            console.log('Horarios cargados desde Firebase');
            availableHours = doc.data();
            renderCalendar(); // Re-renderizar calendario con nueva info
            renderTimeSlots(); // Re-renderizar slots si hubiera fecha seleccionada
        } else {
            console.log('Usando horarios por defecto (no existe config en Firebase)');
            // Si quieres crearlo automáticamente para que aparezca en tu panel, podrías descomentar esto:
            // await docRef.set(availableHours);
        }
    } catch (error) {
        console.error('Error cargando disponibilidad:', error);
    }
}

// Cargar citas reservadas desde Firebase
async function loadBookedAppointments() {
    try {
        const snapshot = await window.firebaseDB.appointmentsCollection.get();
        bookedAppointments = [];
        snapshot.forEach(doc => {
            bookedAppointments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Citas cargadas:', bookedAppointments.length);
    } catch (error) {
        console.error('Error cargando citas:', error);
    }
}

// Renderizar calendario
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Obtener primer día del mes y cantidad de días
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = createDayElement(day, '');
        
        // Marcar hoy
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Deshabilitar días pasados
        if (date < today) {
            dayElement.classList.add('disabled');
        }
        
        // Deshabilitar días sin horarios disponibles
        const dayOfWeek = date.getDay();
        if (!availableHours[dayOfWeek] || availableHours[dayOfWeek].length === 0) {
            dayElement.classList.add('disabled');
        }
        
        // Marcar día seleccionado
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            dayElement.classList.add('selected');
        }
        
        // Agregar evento click
        if (!dayElement.classList.contains('disabled')) {
            dayElement.addEventListener('click', () => selectDate(date));
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Días del mes siguiente
    const totalCells = calendarDays.children.length;
    const remainingCells = 35 - totalCells; // 5 semanas
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, className) {
    const div = document.createElement('div');
    div.className = `calendar-day ${className}`;
    div.textContent = day;
    return div;
}

// Seleccionar fecha
function selectDate(date) {
    selectedDate = date;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    
    // Actualizar display de fecha seleccionada
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('selectedDateDisplay').textContent = 
        date.toLocaleDateString('es-AR', options);
}

// Renderizar horarios disponibles
function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    
    if (!selectedDate) {
        return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    const hours = availableHours[dayOfWeek] || [];
    
    if (hours.length === 0) {
        timeSlotsContainer.innerHTML = '<p style="color: var(--color-secondary);">No hay horarios disponibles para este día.</p>';
        return;
    }
    
    hours.forEach(hour => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = hour;
        
        // Verificar si el horario ya está reservado
        const dateStr = selectedDate.toISOString().split('T')[0];
        const isBooked = bookedAppointments.some(apt => 
            apt.date === dateStr && apt.time === hour
        );
        
        if (isBooked) {
            slot.classList.add('disabled');
        } else {
            slot.addEventListener('click', () => selectTime(hour, slot));
        }
        
        timeSlotsContainer.appendChild(slot);
    });
}

// Seleccionar horario
function selectTime(time, element) {
    selectedTime = time;
    
    // Remover selección anterior
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    // Mostrar formulario de reserva
    document.getElementById('bookingForm').style.display = 'block';
}

// Confirmar reserva
async function confirmBooking() {
    if (!selectedDate || !selectedTime) {
        showMessage('Por favor selecciona una fecha y horario.', 'error');
        return;
    }
    
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const notes = document.getElementById('clientNotes').value.trim();
    
    if (!name || !email || !phone) {
        showMessage('Por favor completa todos los campos requeridos.', 'error');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un email válido.', 'error');
        return;
    }
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const formattedDate = selectedDate.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    try {
        // Guardar en Firebase
        const docRef = await window.firebaseDB.appointmentsCollection.add({
            date: dateStr,
            time: selectedTime,
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            notes: notes,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'confirmed'
        });
        
        console.log('Cita guardada con ID:', docRef.id);
        
        // Enviar emails con EmailJS
        await sendConfirmationEmails(name, email, phone, formattedDate, selectedTime, notes);
        
        showMessage('¡Cita agendada exitosamente! Recibirás un email de confirmación.', 'success');
        
        // Limpiar formulario
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientNotes').value = '';
        document.getElementById('bookingForm').style.display = 'none';
        
        // Recargar citas y actualizar vista
        await loadBookedAppointments();
        renderTimeSlots();
        
    } catch (error) {
        console.error('Error al agendar cita:', error);
        showMessage('Error al agendar la cita. Por favor intenta nuevamente.', 'error');
    }
}

// Enviar emails de confirmación
async function sendConfirmationEmails(clientName, clientEmail, clientPhone, date, time, notes) {
    if (!window.emailjs || !window.emailjsConfig) {
        console.warn('EmailJS no está configurado correctamente');
        return;
    }

    try {
        // Email 1: Para el cliente
        const clientEmailParams = {
            to_name: clientName,
            to_email: clientEmail,
            appointment_date: date,
            appointment_time: time,
            client_phone: clientPhone,
            notes: notes || 'Sin notas adicionales',
            psychologist_name: 'Lic. MM Luena',
            psychologist_phone: '+54 223 5 126 815'
        };

        await emailjs.send(
            window.emailjsConfig.serviceId,
            window.emailjsConfig.templateClientId,
            clientEmailParams
        );
        
        console.log('Email enviado al cliente:', clientEmail);

        // Email 2: Para la psicóloga
        const psychologistEmailParams = {
            psychologist_email: 'milluena@yahoo.com.ar',
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            appointment_date: date,
            appointment_time: time,
            notes: notes || 'Sin notas adicionales'
        };

        await emailjs.send(
            window.emailjsConfig.serviceId,
            window.emailjsConfig.templatePsychologistId,
            psychologistEmailParams
        );
        
        console.log('Email enviado a la psicóloga');

    } catch (error) {
        console.error('Error al enviar emails:', error);
        // No bloqueamos el flujo si falla el email
    }
}

// Enviar emails de confirmación
async function sendConfirmationEmails(clientName, clientEmail, clientPhone, date, time, notes) {
    if (!window.emailjs || !window.emailjsConfig) {
        console.warn('EmailJS no está configurado correctamente');
        return;
    }

    try {
        // Email 1: Para el cliente
        const clientEmailParams = {
            to_name: clientName,
            to_email: clientEmail,
            appointment_date: date,
            appointment_time: time,
            client_phone: clientPhone,
            notes: notes || 'Sin notas adicionales',
            psychologist_name: 'Lic. MM Luena',
            psychologist_phone: '+54 223 5 126 815'
        };

        await emailjs.send(
            window.emailjsConfig.serviceId,
            window.emailjsConfig.templateClientId,
            clientEmailParams
        );
        
        console.log('Email enviado al cliente:', clientEmail);

        // Email 2: Para la psicóloga
        const psychologistEmailParams = {
            psychologist_email: 'milluena@yahoo.com.ar',
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            appointment_date: date,
            appointment_time: time,
            notes: notes || 'Sin notas adicionales'
        };

        await emailjs.send(
            window.emailjsConfig.serviceId,
            window.emailjsConfig.templatePsychologistId,
            psychologistEmailParams
        );
        
        console.log('Email enviado a la psicóloga');

    } catch (error) {
        console.error('Error al enviar emails:', error);
        // No bloqueamos el flujo si falla el email
    }
}

// Crear evento en Google Calendar (opcional - genera URL)
function createGoogleCalendarEvent(date, time, name, email, phone, notes) {
    // Construir URL para Google Calendar
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    
    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después
    
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const details = `
Cliente: ${name}
Teléfono: ${phone}
Email: ${email}
${notes ? 'Notas: ' + notes : ''}
    `.trim();
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Consulta - ' + name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(details)}&location=Consultorio&sf=true&output=xml`;
    
    console.log('URL de Google Calendar generada:', calendarUrl);
    return calendarUrl;
}

// Enviar confirmación por WhatsApp (opcional)
function sendWhatsAppConfirmation(name, date, time, phone) {
    // Construir URL para Google Calendar
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    
    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después
    
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const details = `
Cliente: ${name}
Teléfono: ${phone}
Email: ${email}
${notes ? 'Notas: ' + notes : ''}
    `.trim();
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Consulta - ' + name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(details)}&location=Consultorio&sf=true&output=xml`;
    
    // Abrir en nueva pestaña (opcional)
    // window.open(calendarUrl, '_blank');
    
    console.log('URL de Google Calendar generada:', calendarUrl);
    return calendarUrl;
}

// Enviar confirmación por WhatsApp
function sendWhatsAppConfirmation(name, date, time, phone) {
    const formattedDate = new Date(date).toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const message = `Hola ${name}! Tu cita ha sido confirmada para el ${formattedDate} a las ${time}hs. Cualquier consulta, no dudes en contactarnos. ¡Te esperamos! - Lic. MM Luena`;
    
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp (se puede automatizar más con API de WhatsApp Business)
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}

// Cancelar reserva
function cancelBooking() {
    selectedTime = null;
    document.getElementById('bookingForm').style.display = 'none';
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
}

// Mostrar mensaje
function showMessage(text, type) {
    const messageDiv = document.getElementById('bookingMessage');
    messageDiv.textContent = text;
    messageDiv.className = `booking-message ${type}`;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Event listeners para navegación del calendario
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('confirmBooking').addEventListener('click', confirmBooking);
document.getElementById('cancelBooking').addEventListener('click', cancelBooking);

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    loadAvailability(); // Cargar configuración de horarios
    await loadBookedAppointments();
    renderCalendar();
});

// Animación de entrada para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar secciones para animación
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section, .hero, footer');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Animación de tarjetas individuales
    const cards = document.querySelectorAll('.service-card, .phase, .step-card, .contact-item');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            cardObserver.observe(card);
        }, 0);
    });

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto parallax suave en el hero
    let lastScrollY = window.scrollY;
    const heroImage = document.querySelector('.hero-image');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (heroImage && scrollY < window.innerHeight) {
            heroImage.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        lastScrollY = scrollY;
    });

    // Animación del ícono del cerebro
    const brainIcon = document.querySelector('.brain-icon');
    if (brainIcon) {
        brainIcon.addEventListener('mouseenter', () => {
            brainIcon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        brainIcon.addEventListener('mouseleave', () => {
            brainIcon.style.transform = 'scale(1) rotate(0deg)';
        });
    }
});

// Contador de fase visible
const phases = document.querySelectorAll('.phase');
phases.forEach(phase => {
    phase.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
        this.style.transform = 'translateY(-10px) scale(1.05)';
    });
    
    phase.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Efecto hover en tarjetas de servicio
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// Validación y efectos para información de contacto
const contactItems = document.querySelectorAll('.contact-item a');
contactItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Pequeña animación al hacer clic
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});
