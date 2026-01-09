// Main page logic

let allCourses = [];
let allTutors = [];
let filteredCourses = [];
let selectedTutor = null;
let selectedCourse = null;
let currentPage = 1;
const coursesPerPage = 5;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadCourses();
        await loadTutors();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Ошибка при загрузке данных', 'danger');
    }
});

// Load courses from API
async function loadCourses() {
    try {
        // Try to load from API first
        try {
            allCourses = await API.getCourses();
            console.log('✅ Курсы загружены с API:', allCourses.length);
        } catch (apiError) {
            console.warn('⚠️ API недоступен (Mixed Content), используем тестовые данные');
            // Use mock data as fallback
            if (typeof MOCK_COURSES !== 'undefined') {
                allCourses = MOCK_COURSES;
                showNotification('ℹ️ Демонстрационный режим: показано 9 тестовых курсов', 'warning');
            } else {
                throw new Error('Тестовые данные не загружены');
            }
        }
        
        filteredCourses = [...allCourses];
        displayCourses();
    } catch (error) {
        console.error('❌ Критическая ошибка загрузки курсов:', error);
        document.getElementById('courses-list').innerHTML = 
            `<div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h5>❌ Ошибка загрузки курсов</h5>
                    <p>${error.message}</p>
                </div>
            </div>`;
    }
}

// Display courses with pagination
function displayCourses() {
    const container = document.getElementById('courses-list');
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    if (coursesToShow.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">Курсы не найдены</div>';
        return;
    }

    container.innerHTML = coursesToShow.map(course => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${course.name}</h5>
                    <p class="card-text">${truncateText(course.description, 100)}</p>
                    <ul class="list-unstyled">
                        <li><strong>Преподаватель:</strong> ${course.teacher}</li>
                        <li><strong>Уровень:</strong> ${course.level}</li>
                        <li><strong>Длительность:</strong> ${course.total_length} недель</li>
                        <li><strong>Часов в неделю:</strong> ${course.week_length}</li>
                        <li><strong>Цена:</strong> ${course.course_fee_per_hour} руб./час</li>
                    </ul>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-primary w-100" onclick="openOrderModal(${course.id}, 'course')">
                        Подать заявку
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Update pagination
    createPagination(
        'courses-pagination',
        filteredCourses.length,
        coursesPerPage,
        currentPage,
        (page) => {
            currentPage = page;
            displayCourses();
        }
    );
}

// Load tutors from API
async function loadTutors() {
    try {
        allTutors = await API.getTutors();
        
        // Populate language filter
        const languages = new Set();
        allTutors.forEach(tutor => {
            tutor.languages_offered.forEach(lang => languages.add(lang));
        });
        
        const languageSelect = document.getElementById('tutor-language-search');
        Array.from(languages).sort().forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageSelect.appendChild(option);
        });
        
        displayTutors(allTutors);
    } catch (error) {
        console.error('Error loading tutors:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        document.getElementById('tutors-list').innerHTML = 
            `<tr><td colspan="6" class="text-center">
                <div class="alert alert-warning" role="alert">
                    <h5>⚠️ Не удалось загрузить репетиторов</h5>
                    <p>Проверьте соединение с интернетом или попробуйте позже.</p>
                    <small class="text-muted">Ошибка: ${errorMessage}</small>
                </div>
            </td></tr>`;
    }
}

// Display tutors
function displayTutors(tutors) {
    const tbody = document.getElementById('tutors-list');
    
    if (tutors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Репетиторы не найдены</td></tr>';
        return;
    }

    tbody.innerHTML = tutors.map(tutor => `
        <tr class="${selectedTutor === tutor.id ? 'table-primary' : ''}" id="tutor-row-${tutor.id}">
            <td>${tutor.name}</td>
            <td>${tutor.language_level}</td>
            <td>${tutor.languages_offered.join(', ')}</td>
            <td>${tutor.work_experience}</td>
            <td>${tutor.price_per_hour}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="selectTutor(${tutor.id})">
                    Выбрать
                </button>
            </td>
        </tr>
    `).join('');
}

// Select tutor
function selectTutor(tutorId) {
    selectedTutor = tutorId;
    
    // Update row highlighting
    document.querySelectorAll('#tutors-list tr').forEach(row => {
        row.classList.remove('table-primary');
    });
    document.getElementById(`tutor-row-${tutorId}`).classList.add('table-primary');
    
    // Open order modal
    openOrderModal(tutorId, 'tutor');
}

// Open order modal
async function openOrderModal(id, type) {
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    const form = document.getElementById('order-form');
    form.reset();
    
    document.getElementById('order-id').value = '';
    document.getElementById('orderModalTitle').textContent = 'Оформление заявки';
    document.getElementById('submit-order-btn').textContent = 'Отправить';
    document.getElementById('order-total-price').textContent = '0 руб.';
    document.getElementById('auto-options-info').style.display = 'none';
    
    // Reset time select
    const timeSelect = document.getElementById('order-time');
    timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
    timeSelect.disabled = true;
    
    try {
        if (type === 'course') {
            selectedCourse = await API.getCourseById(id);
            document.getElementById('order-course-id').value = id;
            document.getElementById('order-tutor-id').value = '';
            document.getElementById('order-course-name').value = selectedCourse.name;
            document.getElementById('order-teacher-name').value = selectedCourse.teacher;
            
            // Populate available dates
            const dateSelect = document.getElementById('order-date');
            const dates = selectedCourse.start_dates.map(dt => formatDateForInput(dt));
            
            // Set min date to first available date
            if (dates.length > 0) {
                dateSelect.min = dates[0];
            }
            dateSelect.value = ''; // Reset value
            
            // Setup time select based on available dates
            populateTimeOptions(selectedCourse.start_dates);
            
            // Show duration info
            document.getElementById('order-duration').value = 
                `${selectedCourse.total_length} недель (${selectedCourse.week_length} часов/неделю)`;
            
        } else if (type === 'tutor') {
            const tutor = allTutors.find(t => t.id === id);
            
            // Create a pseudo-course object for tutors to use in price calculation
            selectedCourse = {
                course_fee_per_hour: tutor.price_per_hour,
                total_length: 1,
                week_length: 1
            };
            
            document.getElementById('order-tutor-id').value = id;
            document.getElementById('order-course-id').value = '';
            document.getElementById('order-course-name').value = `Репетитор: ${tutor.name}`;
            document.getElementById('order-teacher-name').value = tutor.name;
            
            // For tutors, allow any future date
            const dateInput = document.getElementById('order-date');
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = ''; // Reset value
            
            // Setup time options for tutors (9:00 - 20:00)
            populateTutorTimeOptions();
            
            document.getElementById('order-duration').value = '1 час (стандартное занятие)';
        }
        
        modal.show();
    } catch (error) {
        console.error('Error opening modal:', error);
        showNotification('Ошибка при открытии формы заявки', 'danger');
    }
}

// Populate time options for courses
function populateTimeOptions(startDates) {
    const timeSelect = document.getElementById('order-time');
    const dateInput = document.getElementById('order-date');
    
    // Remove old event listeners by cloning
    const newDateInput = dateInput.cloneNode(true);
    dateInput.parentNode.replaceChild(newDateInput, dateInput);
    
    // Get the new element reference
    const dateField = document.getElementById('order-date');
    
    // Add change event listener
    dateField.addEventListener('change', function() {
        const selectedDate = this.value;
        
        if (!selectedDate) {
            timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
            timeSelect.disabled = true;
            return;
        }
        
        // Clear and enable time select
        timeSelect.innerHTML = '<option value="">Выберите время</option>';
        timeSelect.disabled = false;
        
        // Filter times for selected date
        let hasOptions = false;
        startDates.forEach(dt => {
            const date = formatDateForInput(dt);
            if (date === selectedDate) {
                const time = formatTime(dt);
                const endTime = calculateEndTime(time, selectedCourse.week_length);
                const option = document.createElement('option');
                option.value = time;
                option.textContent = `${time} - ${endTime}`;
                timeSelect.appendChild(option);
                hasOptions = true;
            }
        });
        
        if (!hasOptions) {
            timeSelect.innerHTML = '<option value="">Нет доступного времени для этой даты</option>';
            timeSelect.disabled = true;
        }
    });
    
    // Add time change listener for price update
    timeSelect.addEventListener('change', updatePrice);
}

// Populate time options for tutors
function populateTutorTimeOptions() {
    const timeSelect = document.getElementById('order-time');
    const dateInput = document.getElementById('order-date');
    
    // Remove old event listeners by cloning
    const newDateInput = dateInput.cloneNode(true);
    dateInput.parentNode.replaceChild(newDateInput, dateInput);
    
    // Get the new element reference
    const dateField = document.getElementById('order-date');
    
    // Add change event listener
    dateField.addEventListener('change', function() {
        const selectedDate = this.value;
        
        if (!selectedDate) {
            timeSelect.innerHTML = '<option value="">Сначала выберите дату</option>';
            timeSelect.disabled = true;
            return;
        }
        
        // Clear and enable time select
        timeSelect.innerHTML = '<option value="">Выберите время</option>';
        timeSelect.disabled = false;
        
        // Add time slots from 9:00 to 20:00
        for (let hour = 9; hour <= 20; hour++) {
            const time = `${String(hour).padStart(2, '0')}:00`;
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        }
    });
    
    // Add time change listener for price update
    timeSelect.addEventListener('change', updatePrice);
}

// Setup event listeners
function setupEventListeners() {
    // Course search
    document.getElementById('course-name-search').addEventListener('input', filterCourses);
    document.getElementById('course-level-search').addEventListener('change', filterCourses);
    
    // Tutor search
    document.getElementById('tutor-language-search').addEventListener('change', filterTutors);
    document.getElementById('tutor-level-search').addEventListener('change', filterTutors);
    document.getElementById('tutor-experience-search').addEventListener('input', filterTutors);
    
    // Order form - students number
    document.getElementById('order-persons').addEventListener('input', updatePrice);
    
    // Optional checkboxes
    ['supplementary', 'personalized', 'excursions', 'assessment', 'interactive'].forEach(option => {
        document.getElementById(`option-${option}`).addEventListener('change', updatePrice);
    });
    
    // Submit order
    document.getElementById('submit-order-btn').addEventListener('click', submitOrder);
}

// Filter courses
function filterCourses() {
    const nameSearch = document.getElementById('course-name-search').value.toLowerCase();
    const levelSearch = document.getElementById('course-level-search').value;
    
    filteredCourses = allCourses.filter(course => {
        const matchesName = course.name.toLowerCase().includes(nameSearch);
        const matchesLevel = !levelSearch || course.level === levelSearch;
        return matchesName && matchesLevel;
    });
    
    currentPage = 1;
    displayCourses();
}

// Filter tutors
function filterTutors() {
    const languageSearch = document.getElementById('tutor-language-search').value;
    const levelSearch = document.getElementById('tutor-level-search').value;
    const experienceSearch = parseInt(document.getElementById('tutor-experience-search').value) || 0;
    
    const filtered = allTutors.filter(tutor => {
        const matchesLanguage = !languageSearch || tutor.languages_offered.includes(languageSearch);
        const matchesLevel = !levelSearch || tutor.language_level === levelSearch;
        const matchesExperience = tutor.work_experience >= experienceSearch;
        return matchesLanguage && matchesLevel && matchesExperience;
    });
    
    displayTutors(filtered);
}

// Update price in order form
function updatePrice() {
    const dateStart = document.getElementById('order-date').value;
    const timeStart = document.getElementById('order-time').value;
    const studentsNumber = parseInt(document.getElementById('order-persons').value) || 1;
    
    if (!dateStart || !timeStart || !selectedCourse) {
        document.getElementById('order-total-price').textContent = '0 руб.';
        return;
    }
    
    // Get course data
    const courseFeePerHour = selectedCourse.course_fee_per_hour;
    const durationInHours = selectedCourse.total_length * selectedCourse.week_length;
    const weekLength = selectedCourse.week_length;
    
    // Check automatic options
    const earlyReg = isEarlyRegistration(dateStart);
    const groupEnroll = studentsNumber >= 5;
    const intensive = weekLength >= 5;
    
    // Get user-selected options
    const orderOptions = {
        earlyRegistration: earlyReg,
        groupEnrollment: groupEnroll,
        intensiveCourse: intensive,
        supplementary: document.getElementById('option-supplementary').checked,
        personalized: document.getElementById('option-personalized').checked,
        excursions: document.getElementById('option-excursions').checked,
        assessment: document.getElementById('option-assessment').checked,
        interactive: document.getElementById('option-interactive').checked
    };
    
    // Show automatic options
    const autoOptionsInfo = document.getElementById('auto-options-info');
    const autoOptionsList = document.getElementById('auto-options-list');
    const autoOptions = [];
    
    if (earlyReg) autoOptions.push('Скидка за раннюю регистрацию (-10%)');
    if (groupEnroll) autoOptions.push('Скидка за групповую запись (-15%)');
    if (intensive) autoOptions.push('Интенсивный курс (+20%)');
    
    if (autoOptions.length > 0) {
        autoOptionsList.innerHTML = autoOptions.map(opt => `<li>${opt}</li>`).join('');
        autoOptionsInfo.style.display = 'block';
    } else {
        autoOptionsInfo.style.display = 'none';
    }
    
    // Calculate price
    const courseData = {
        courseFeePerHour,
        durationInHours,
        dateStart,
        timeStart,
        studentsNumber,
        weekLength
    };
    
    const totalPrice = calculateCoursePrice(courseData, orderOptions);
    document.getElementById('order-total-price').textContent = `${totalPrice} руб.`;
}

// Submit order
async function submitOrder() {
    const form = document.getElementById('order-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const orderId = document.getElementById('order-id').value;
    const courseId = document.getElementById('order-course-id').value;
    const tutorId = document.getElementById('order-tutor-id').value;
    const dateStart = document.getElementById('order-date').value;
    const timeStart = document.getElementById('order-time').value;
    const persons = parseInt(document.getElementById('order-persons').value);
    
    // Calculate duration
    let duration;
    if (courseId) {
        duration = selectedCourse.total_length * selectedCourse.week_length;
    } else {
        duration = 1; // Default for tutors
    }
    
    // Get price
    const priceText = document.getElementById('order-total-price').textContent;
    const price = parseInt(priceText.replace(/\D/g, ''));
    
    if (!price || price === 0) {
        showNotification('Пожалуйста, проверьте все поля формы. Стоимость не рассчитана.', 'danger');
        return;
    }
    
    // Build order data
    const orderData = {
        date_start: dateStart,
        time_start: timeStart,
        duration,
        persons,
        price,
        early_registration: courseId ? isEarlyRegistration(dateStart) : false,
        group_enrollment: persons >= 5,
        intensive_course: selectedCourse && selectedCourse.week_length >= 5,
        supplementary: document.getElementById('option-supplementary').checked,
        personalized: document.getElementById('option-personalized').checked,
        excursions: document.getElementById('option-excursions').checked,
        assessment: document.getElementById('option-assessment').checked,
        interactive: document.getElementById('option-interactive').checked
    };
    
    if (courseId) {
        orderData.course_id = parseInt(courseId);
        orderData.tutor_id = 0;
    } else {
        orderData.tutor_id = parseInt(tutorId);
        orderData.course_id = 0;
    }
    
    try {
        const courseName = document.getElementById('order-course-name').value;
        
        if (orderId) {
            await API.updateOrder(orderId, orderData);
            showNotification(`✅ Заявка "${courseName}" успешно обновлена! Стоимость: ${price} руб.`, 'success');
        } else {
            await API.createOrder(orderData);
            showNotification(`✅ Заявка "${courseName}" успешно создана! Стоимость: ${price} руб. Проверьте в личном кабинете.`, 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification(`❌ Ошибка при оформлении заявки: ${error.message}`, 'danger');
    }
}