// Global variables for calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let loadedEvents = []; // To store events loaded from JSON
let currentLanguage = 'ukr'; // Default language, will be updated by getCurrentLanguage()

// Language-specific data
const languageData = {
    ukr: {
        monthNames: [
            "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
            "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
        ],
        dayNames: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        modalDatePrefix: "Події на",
        noEventsMessage: "Немає подій на цей день.",
        locationLabel: "Місце",
        timeLabel: "Час",
        descriptionLabel: "Опис",
        noDescriptionText: "Немає опису."
    },
    es: {
        monthNames: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ],
        dayNames: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        modalDatePrefix: "Eventos para el",
        noEventsMessage: "No hay eventos para este día.",
        locationLabel: "Ubicación",
        timeLabel: "Hora",
        descriptionLabel: "Descripción",
        noDescriptionText: "Sin descripción."
    }
};

// References to modal elements
let eventModal;
let modalDateEl;
let modalEventsListEl;
let noEventsMessageEl;
let closeButton;

// Function to get the current language based on URL path segments
function getCurrentLanguage() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');

    if (pathSegments.includes('ukr')) {
        return 'ukr';
    } else if (pathSegments.includes('es')) {
        return 'es';
    }
    return 'ukr'; // Default to Ukrainian if no language segment is found
}


// Function to initialize the custom calendar
async function initCustomCalendar() {
    console.log("initCustomCalendar function started.");

    const calendarDaysEl = document.getElementById('calendar-days');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Get modal element references
    eventModal = document.getElementById('eventModal');
    modalDateEl = document.getElementById('modalDate');
    modalEventsListEl = document.getElementById('modalEventsList');
    noEventsMessageEl = document.getElementById('noEventsMessage');
    closeButton = document.querySelector('.close-button');


    if (!calendarDaysEl || !currentMonthYearEl || !prevMonthBtn || !nextMonthBtn ||
        !eventModal || !modalDateEl || !modalEventsListEl || !closeButton || !noEventsMessageEl) {
        console.error("One or more required calendar/modal elements not found. Check IDs/classes in HTML. Calendar initialization aborted.");
        return;
    }

    // Set initial language and render based on URL path
    currentLanguage = getCurrentLanguage();
    await setLanguageAndRender(currentLanguage); // Initial load and render based on detected language

    // Add event listeners for month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Add event listeners for modal close button and outside click
    closeButton.addEventListener('click', closeEventModal);
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) { // Only close if clicking on the background, not modal content
            closeEventModal();
        }
    });
}

/**
 * Sets the current language, reloads events, and re-renders the calendar.
 * @param {string} lang - The language code ('ukr' or 'es').
 */
async function setLanguageAndRender(lang) {
    if (!languageData[lang]) {
        console.error(`Unsupported language: ${lang}`);
        return;
    }
    currentLanguage = lang; // Update the global currentLanguage
    console.log(`Setting language to: ${currentLanguage}`);

    try {
        loadedEvents = await loadEventsData();
        console.log("Events loaded for current language:", loadedEvents);
        renderCalendar();
    } catch (error) {
        console.error("Failed to load events data for language:", currentLanguage, error);
        loadedEvents = []; // Clear events on error
        renderCalendar(); // Render calendar even if events fail to load
    }
}


// Function to fetch event data from JSON file based on current language
async function loadEventsData() {
    try {
        const eventsPath = `../../data/${currentLanguage}/events/events.json`;
        const response = await fetch(eventsPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} from ${eventsPath}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching events.json for language", currentLanguage, ":", error);
        return []; // Return empty array on error
    }
}

// Function to render the calendar grid and display events
function renderCalendar() {
    const calendarDaysEl = document.getElementById('calendar-days');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    calendarDaysEl.innerHTML = ''; // Clear previous days

    const { monthNames, dayNames } = languageData[currentLanguage];

    currentMonthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Display day names (e.g., Нд, Пн for ukr or Dom, Lun for es)
    const calendarWeekDaysEl = document.getElementById('calendar-weekdays');
    if (calendarWeekDaysEl) { // Ensure this element exists in your HTML
        calendarWeekDaysEl.innerHTML = '';
        dayNames.forEach(dayName => {
            const dayNameEl = document.createElement('div');
            dayNameEl.classList.add('weekday-name');
            dayNameEl.textContent = dayName;
            calendarWeekDaysEl.appendChild(dayNameEl);
        });
    }


    // Get the first day of the month (0 for Sunday, 6 for Saturday)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Get the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'inactive');
        calendarDaysEl.appendChild(emptyDay);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.innerHTML = `<span class="day-number">${day}</span>`;

        // Mark today's date
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }

        // Store events for this specific day to display all on click
        const eventsForThisDay = [];

        // Add events for this day
        loadedEvents.forEach(event => {
            let addEvent = false;

            if (event.recurrence.type === 'weekly' && event.recurrence.dayOfWeek === dayOfWeek) {
                addEvent = true;
            } else if (event.recurrence.type === 'bi-weekly-saturday' && dayOfWeek === 6) { // It's a Saturday
                const weekOfMonth = Math.floor((day - 1) / 7) + 1;
                // Assuming 1st, 3rd, 5th Saturdays
                if (weekOfMonth % 2 !== 0) {
                    addEvent = true;
                }
            }

            if (addEvent) {
                // Create the full event text element (visible on large screens, hidden on small by CSS)
                const eventEl = document.createElement('div');
                eventEl.classList.add('calendar-event');
                if (event.colorClass) {
                    eventEl.classList.add(event.colorClass);
                }
                eventEl.textContent = `${event.time} ${event.title}`;
                eventEl.title = `${event.title} (${event.location}, ${event.time})`; // Tooltip for desktop
                dayEl.appendChild(eventEl);

                // Create the dot indicator element (hidden on large screens, visible on small by CSS)
                const eventDotEl = document.createElement('div');
                eventDotEl.classList.add('calendar-event-dot');
                if (event.colorClass) {
                    eventDotEl.classList.add(event.colorClass); // Apply color class to dot
                }
                eventDotEl.title = `${event.title} (${event.time})`; // Tooltip for dot
                dayEl.appendChild(eventDotEl);

                eventsForThisDay.push(event); // Add event to list for this day
            }
        });

        // Add click listener to the *day* itself to open the modal
        dayEl.addEventListener('click', () => {
            openEventModal(date, eventsForThisDay);
        });

        calendarDaysEl.appendChild(dayEl);
    }
}

// Function to open the event details modal
function openEventModal(date, events) {
    const { modalDatePrefix, noEventsMessage, locationLabel, timeLabel, descriptionLabel, noDescriptionText } = languageData[currentLanguage];

    modalDateEl.textContent = `${modalDatePrefix} ${date.toLocaleDateString(currentLanguage === 'ukr' ? 'uk-UA' : 'es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    modalEventsListEl.innerHTML = ''; // Clear previous events

    if (events.length === 0) {
        noEventsMessageEl.textContent = noEventsMessage;
        noEventsMessageEl.style.display = 'block';
    } else {
        noEventsMessageEl.style.display = 'none';
        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('modal-event-item');
            if (event.colorClass) {
                eventItem.classList.add(event.colorClass);
            }
            eventItem.innerHTML = `
                <h4>${event.title}</h4>
                <p><strong>${locationLabel}:</strong> ${event.location}</p>
                <p><strong>${timeLabel}:</strong> ${event.time}</p>
                <p><strong>${descriptionLabel}:</strong> ${event.description || noDescriptionText}</p>
            `;
            modalEventsListEl.appendChild(eventItem);
        });
    }

    // Change: Use classList to show the modal
    eventModal.classList.add('is-visible');
}

// Function to close the event details modal
function closeEventModal() {
    // Change: Use classList to hide the modal
    eventModal.classList.remove('is-visible');
}