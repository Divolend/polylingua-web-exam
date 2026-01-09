// Utility functions

// Show notification
function showNotification(message, type = 'success') {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;

    const alertId = 'alert-' + Date.now();
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    
    // Choose icon based on type
    let icon = '';
    if (type === 'success') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
    } else {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>';
    }
    
    const alertHTML = `
        <div id="${alertId}" class="alert ${alertClass} alert-dismissible fade show d-flex align-items-center" role="alert">
            ${icon}
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto-remove after 5 seconds with fade out animation
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.classList.add('fade-out');
            setTimeout(() => {
                const bsAlert = bootstrap.Alert.getInstance(alertElement);
                if (bsAlert) {
                    bsAlert.close();
                } else {
                    alertElement.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Format time (HH:MM)
function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toTimeString().slice(0, 5);
}

// Calculate end time based on start time and duration
function calculateEndTime(startTime, durationHours) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    const endMinutes = minutes;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// Check if date is weekend (Saturday or Sunday)
function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
}

// Check if time is morning (9:00-12:00)
function isMorningTime(timeString) {
    const [hours] = timeString.split(':').map(Number);
    return hours >= 9 && hours < 12;
}

// Check if time is evening (18:00-20:00)
function isEveningTime(timeString) {
    const [hours] = timeString.split(':').map(Number);
    return hours >= 18 && hours < 20;
}

// Check if registration is early (at least 30 days in advance)
function isEarlyRegistration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 30;
}

// Calculate course price
function calculateCoursePrice(courseData, orderOptions) {
    const {
        courseFeePerHour,
        durationInHours,
        dateStart,
        timeStart,
        studentsNumber
    } = courseData;

    // Base calculation
    const weekendMultiplier = isWeekend(dateStart) ? 1.5 : 1;
    const morningSurcharge = isMorningTime(timeStart) ? 400 : 0;
    const eveningSurcharge = isEveningTime(timeStart) ? 1000 : 0;

    let basePrice = ((courseFeePerHour * durationInHours * weekendMultiplier) + 
                     morningSurcharge + eveningSurcharge) * studentsNumber;

    // Apply options
    if (orderOptions.earlyRegistration) {
        basePrice *= 0.9; // 10% discount
    }
    
    if (orderOptions.groupEnrollment) {
        basePrice *= 0.85; // 15% discount
    }
    
    if (orderOptions.intensiveCourse) {
        basePrice *= 1.2; // 20% surcharge
    }
    
    if (orderOptions.supplementary) {
        basePrice += 2000 * studentsNumber;
    }
    
    if (orderOptions.personalized) {
        const weeks = durationInHours / courseData.weekLength;
        basePrice += 1500 * weeks;
    }
    
    if (orderOptions.excursions) {
        basePrice *= 1.25; // 25% surcharge
    }
    
    if (orderOptions.assessment) {
        basePrice += 300;
    }
    
    if (orderOptions.interactive) {
        basePrice *= 1.5; // 50% surcharge
    }

    return Math.round(basePrice);
}

// Create pagination
function createPagination(containerId, totalItems, itemsPerPage, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Предыдущая</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Следующая</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    container.innerHTML = paginationHTML;
    
    // Add click handlers
    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage) {
                onPageChange(page);
            }
        });
    });
}

// Truncate text with tooltip
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}