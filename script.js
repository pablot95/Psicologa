let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let bookedAppointments = [];

window.addEventListener('scroll', () => {
    const floatingBtn = document.getElementById('floatingBookBtn');
    const hero = document.querySelector('.hero');
    
    if (hero && floatingBtn) {
        const heroHeight = hero.offsetHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > heroHeight - 100) {
            floatingBtn.style.display = 'flex';
            floatingBtn.classList.add('show');
        } else {
            floatingBtn.style.display = 'none';
            floatingBtn.classList.remove('show');
        }
    }
});

let availableHours = {
    1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    5: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    6: [],
    0: []
};

async function loadAvailability() {
    try {
        const docRef = window.firebaseDB.db.collection('config_gral').doc('horarios');
        const doc = await docRef.get();
        if (doc.exists) {
            availableHours = doc.data();
            renderCalendar();
            renderTimeSlots();
        }
    } catch (error) {
        console.error('Error cargando disponibilidad:', error);
    }
}

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
    } catch (error) {
        console.error('Error cargando citas:', error);
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = createDayElement(day, '');
        
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        if (date < today) {
            dayElement.classList.add('disabled');
        }
        
        const dayOfWeek = date.getDay();
        if (!availableHours[dayOfWeek] || availableHours[dayOfWeek].length === 0) {
            dayElement.classList.add('disabled');
        }
        
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            dayElement.classList.add('selected');
        }
        
        if (!dayElement.classList.contains('disabled')) {
            dayElement.addEventListener('click', () => selectDate(date));
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    const totalCells = calendarDays.children.length;
    const remainingCells = 35 - totalCells;
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

function selectDate(date) {
    selectedDate = date;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('selectedDateDisplay').textContent = 
        date.toLocaleDateString('es-AR', options);
}

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

function selectTime(time, element) {
    selectedTime = time;
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    document.getElementById('bookingForm').style.display = 'block';
}

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
        
        await sendConfirmationEmails(name, email, phone, formattedDate, selectedTime, notes);
        
        showMessage('¡Cita agendada exitosamente! Recibirás un email de confirmación.', 'success');
        
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientNotes').value = '';
        document.getElementById('bookingForm').style.display = 'none';
        
        await loadBookedAppointments();
        renderTimeSlots();
        
    } catch (error) {
        console.error('Error al agendar cita:', error);
        showMessage('Error al agendar la cita. Por favor intenta nuevamente.', 'error');
    }
}

async function sendConfirmationEmails(clientName, clientEmail, clientPhone, date, time, notes) {
    if (!window.emailjs || !window.emailjsConfig) {
        return;
    }

    try {
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

    } catch (error) {
        console.error('Error al enviar emails:', error);
    }
}

function createGoogleCalendarEvent(date, time, name, email, phone, notes) {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    
    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
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
    
    return calendarUrl;
}

function sendWhatsAppConfirmation(name, date, time, phone) {
    const formattedDate = new Date(date).toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const message = `Hola ${name}! Tu cita ha sido confirmada para el ${formattedDate} a las ${time}hs. Cualquier consulta, no dudes en contactarnos. ¡Te esperamos! - Lic. MM Luena`;
    
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}

function cancelBooking() {
    selectedTime = null;
    document.getElementById('bookingForm').style.display = 'none';
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('bookingMessage');
    messageDiv.textContent = text;
    messageDiv.className = `booking-message ${type}`;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

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

document.addEventListener('DOMContentLoaded', async () => {
    loadAvailability();
    await loadBookedAppointments();
    renderCalendar();
});

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

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section, .hero, footer');
    sections.forEach(section => {
        observer.observe(section);
    });

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

    let lastScrollY = window.scrollY;
    const heroImage = document.querySelector('.hero-image');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (heroImage && scrollY < window.innerHeight) {
            heroImage.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        lastScrollY = scrollY;
    });

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

const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

const contactItems = document.querySelectorAll('.contact-item a');
contactItems.forEach(item => {
    item.addEventListener('click', function(e) {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});
