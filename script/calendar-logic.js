// Global variables for calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let loadedEvents = []; // To store events loaded from JSON

const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// References to modal elements
let eventModal;
let modalDateEl;
let modalEventsListEl;
let noEventsMessageEl;
let closeButton;

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

    // Load events from JSON file
    try {
        loadedEvents = await loadEventsData();
        console.log("Events loaded:", loadedEvents);
    } catch (error) {
        console.error("Failed to load events data:", error);
        // Optionally display a message to the user that events couldn't be loaded
    }

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

    renderCalendar(); // Initial render of the calendar
}

// Function to fetch event data from JSON file
async function loadEventsData() {
    try {
        const response = await fetch('../../data/events/events.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching events.json:", error);
        return []; // Return empty array on error
    }
}

// Function to render the calendar grid and display events
function renderCalendar() {
    const calendarDaysEl = document.getElementById('calendar-days');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    calendarDaysEl.innerHTML = ''; // Clear previous days

    currentMonthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

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
                if (weekOfMonth === 1 || weekOfMonth === 3 || weekOfMonth === 5) {
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
    modalDateEl.textContent = `Події на ${date.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    modalEventsListEl.innerHTML = ''; // Clear previous events

    if (events.length === 0) {
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
                <p><strong>Місце:</strong> ${event.location}</p>
                <p><strong>Час:</strong> ${event.time}</p>
                <p><strong>Опис:</strong> ${event.description || 'Немає опису.'}</p>
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