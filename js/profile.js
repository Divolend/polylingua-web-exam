// Profile page logic

let allOrders = [];
let currentPage = 1;
const ordersPerPage = 5;
let orderToDelete = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadOrders();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Ошибка при загрузке данных', 'danger');
    }
});

// Load orders from API
async function loadOrders() {
    try {
        allOrders = await API.getOrders();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Ошибка загрузки заявок</td></tr>';
        showNotification('❌ Не удалось загрузить список заявок. Проверьте подключение к интернету.', 'danger');
    }
}

// Display orders with pagination
function displayOrders() {
    const tbody = document.getElementById('orders-list');
    const emptyState = document.getElementById('empty-state');
    const table = tbody.closest('table');
    
    if (allOrders.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('orders-pagination').innerHTML = '';
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = allOrders.slice(startIndex, endIndex);
    
    tbody.innerHTML = ordersToShow.map((order, index) => {
        const orderNumber = startIndex + index + 1;
        return `
            <tr>
                <td>${orderNumber}</td>
                <td id="order-name-${order.id}">Загрузка...</td>
                <td>${formatDate(order.date_start)} в ${order.time_start}</td>
                <td>${order.price} руб.</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-info" onclick="viewOrderDetails(${order.id})" title="Подробнее">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="editOrder(${order.id})" title="Изменить">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger" onclick="confirmDeleteOrder(${order.id})" title="Удалить">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Load course/tutor names
    ordersToShow.forEach(async (order) => {
        try {
            let name = '';
            if (order.course_id > 0) {
                const course = await API.getCourseById(order.course_id);
                name = course.name;
            } else if (order.tutor_id > 0) {
                const tutor = await API.getTutorById(order.tutor_id);
                name = `Репетитор: ${tutor.name}`;
            }
            const nameCell = document.getElementById(`order-name-${order.id}`);
            if (nameCell) {
                nameCell.textContent = name;
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            const nameCell = document.getElementById(`order-name-${order.id}`);
            if (nameCell) {
                nameCell.textContent = 'Ошибка загрузки';
            }
        }
    });
    
    // Update pagination
    createPagination(
        'orders-pagination',
        allOrders.length,
        ordersPerPage,
        currentPage,
        (page) => {
            currentPage = page;
            displayOrders();
        }
    );
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;
        
        let courseName = 'Загрузка...';
        let description = '';
        
        if (order.course_id > 0) {
            const course = await API.getCourseById(order.course_id);
            courseName = course.name;
            description = course.description;
        } else if (order.tutor_id > 0) {
            const tutor = await API.getTutorById(order.tutor_id);
            courseName = `Репетитор: ${tutor.name}`;
            description = `Языки: ${tutor.languages_offered.join(', ')}. Опыт: ${tutor.work_experience} лет.`;
        }
        
        const appliedOptions = [];
        if (order.early_registration) appliedOptions.push('Скидка за раннюю регистрацию');
        if (order.group_enrollment) appliedOptions.push('Скидка за групповую запись');
        if (order.intensive_course) appliedOptions.push('Интенсивный курс');
        if (order.supplementary) appliedOptions.push('Дополнительные материалы');
        if (order.personalized) appliedOptions.push('Индивидуальные занятия');
        if (order.excursions) appliedOptions.push('Культурные экскурсии');
        if (order.assessment) appliedOptions.push('Оценка уровня');
        if (order.interactive) appliedOptions.push('Интерактивная платформа');
        
        const detailsHTML = `
            <div class="mb-3">
                <strong>Курс/Репетитор:</strong><br>
                ${courseName}
            </div>
            ${description ? `
            <div class="mb-3">
                <strong>Описание:</strong><br>
                ${description}
            </div>
            ` : ''}
            <div class="mb-3">
                <strong>Дата начала:</strong> ${formatDate(order.date_start)}<br>
                <strong>Время:</strong> ${order.time_start}<br>
                <strong>Продолжительность:</strong> ${order.duration} час(ов)
            </div>
            <div class="mb-3">
                <strong>Количество студентов:</strong> ${order.persons}
            </div>
            ${appliedOptions.length > 0 ? `
            <div class="mb-3">
                <strong>Применённые опции:</strong>
                <ul>
                    ${appliedOptions.map(opt => `<li>${opt}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            <div class="mb-3">
                <strong class="fs-5">Общая стоимость:</strong> 
                <span class="text-primary fs-5">${order.price} руб.</span>
            </div>
        `;
        
        document.getElementById('order-details-content').innerHTML = detailsHTML;
        const modal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
        modal.show();
    } catch (error) {
        console.error('Error viewing order details:', error);
        showNotification('❌ Ошибка при загрузке деталей заявки', 'danger');
    }
}

// Edit order
async function editOrder(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;
        
        // Populate form
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-course-id').value = order.course_id || '';
        document.getElementById('edit-tutor-id').value = order.tutor_id || '';
        document.getElementById('edit-date').value = order.date_start;
        document.getElementById('edit-time').value = order.time_start;
        document.getElementById('edit-persons').value = order.persons;
        document.getElementById('edit-duration').value = order.duration;
        document.getElementById('edit-price').value = order.price;
        
        // Set checkboxes
        document.getElementById('edit-supplementary').checked = order.supplementary;
        document.getElementById('edit-personalized').checked = order.personalized;
        document.getElementById('edit-excursions').checked = order.excursions;
        document.getElementById('edit-assessment').checked = order.assessment;
        document.getElementById('edit-interactive').checked = order.interactive;
        
        // Get and display course/tutor name
        let courseName = '';
        if (order.course_id > 0) {
            const course = await API.getCourseById(order.course_id);
            courseName = course.name;
        } else if (order.tutor_id > 0) {
            const tutor = await API.getTutorById(order.tutor_id);
            courseName = `Репетитор: ${tutor.name}`;
        }
        document.getElementById('edit-course-name').value = courseName;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
        modal.show();
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showNotification('❌ Ошибка при открытии формы редактирования', 'danger');
    }
}

// Save edited order
async function saveOrder() {
    const form = document.getElementById('edit-order-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const orderId = document.getElementById('edit-order-id').value;
    const courseId = document.getElementById('edit-course-id').value;
    const tutorId = document.getElementById('edit-tutor-id').value;
    const courseName = document.getElementById('edit-course-name').value;
    
    const orderData = {
        date_start: document.getElementById('edit-date').value,
        time_start: document.getElementById('edit-time').value,
        persons: parseInt(document.getElementById('edit-persons').value),
        duration: parseInt(document.getElementById('edit-duration').value),
        price: parseInt(document.getElementById('edit-price').value),
        supplementary: document.getElementById('edit-supplementary').checked,
        personalized: document.getElementById('edit-personalized').checked,
        excursions: document.getElementById('edit-excursions').checked,
        assessment: document.getElementById('edit-assessment').checked,
        interactive: document.getElementById('edit-interactive').checked
    };
    
    if (courseId) {
        orderData.course_id = parseInt(courseId);
        orderData.tutor_id = 0;
    } else {
        orderData.tutor_id = parseInt(tutorId);
        orderData.course_id = 0;
    }
    
    try {
        await API.updateOrder(orderId, orderData);
        showNotification(`✅ Заявка "${courseName}" успешно обновлена! Новая стоимость: ${orderData.price} руб.`, 'success');
        
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById('editOrderModal')).hide();
        
        // Reload orders
        await loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification(`❌ Ошибка при обновлении заявки: ${error.message}`, 'danger');
    }
}

// Confirm delete order
function confirmDeleteOrder(orderId) {
    orderToDelete = orderId;
    const modal = new bootstrap.Modal(document.getElementById('deleteOrderModal'));
    modal.show();
}

// Delete order
async function deleteOrder() {
    if (!orderToDelete) return;
    
    try {
        // Get order info before deleting
        const order = allOrders.find(o => o.id === orderToDelete);
        let courseName = 'Заявка';
        
        if (order) {
            try {
                if (order.course_id > 0) {
                    const course = await API.getCourseById(order.course_id);
                    courseName = course.name;
                } else if (order.tutor_id > 0) {
                    const tutor = await API.getTutorById(order.tutor_id);
                    courseName = `Репетитор: ${tutor.name}`;
                }
            } catch (e) {
                // If we can't get the name, just use generic text
                courseName = 'Заявка';
            }
        }
        
        await API.deleteOrder(orderToDelete);
        showNotification(`✅ Заявка "${courseName}" успешно удалена!`, 'success');
        
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById('deleteOrderModal')).hide();
        
        // Remove from array
        allOrders = allOrders.filter(o => o.id !== orderToDelete);
        
        // Adjust current page if needed
        const totalPages = Math.ceil(allOrders.length / ordersPerPage);
        if (currentPage > totalPages && currentPage > 1) {
            currentPage = totalPages;
        }
        
        // Refresh display
        displayOrders();
        orderToDelete = null;
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification(`❌ Ошибка при удалении заявки: ${error.message}`, 'danger');
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('save-order-btn').addEventListener('click', saveOrder);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteOrder);
}

// Make functions available globally
window.viewOrderDetails = viewOrderDetails;
window.editOrder = editOrder;
window.confirmDeleteOrder = confirmDeleteOrder;