// В локальной разработке — http://localhost:8080/api/contacts
// На Heroku — https://твой-адрес.herokuapp.com/api/contacts
const API_URL = '/api/contacts';

// DOM элементы
const contactsList = document.getElementById('contactsList');
const contactCount = document.getElementById('contactCount');
const contactForm = document.getElementById('contactForm');
const formTitle = document.getElementById('formTitle');
const contactId = document.getElementById('contactId');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const mobileInput = document.getElementById('mobile');
const homeInput = document.getElementById('home');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// Текущий выбранный контакт (для подсветки)
let selectedContactId = null;

// --- Вспомогательные функции ---

// Функция для получения всех контактов
async function fetchContacts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Не удалось загрузить контакты', 'danger');
        return [];
    }
}

// Функция для отображения контактов в списке
function renderContacts(contacts) {
    // Очищаем список
    contactsList.innerHTML = '';

    // Обновляем счетчик
    contactCount.textContent = contacts.length;

    if (contacts.length === 0) {
        contactsList.innerHTML = `
            <div class="list-group-item text-center text-muted py-4 empty-state">
                <i class="bi bi-inbox fs-1 d-block"></i>
                Нет контактов
            </div>
        `;
        return;
    }

    // Сортируем по имени (для удобства)
    contacts.sort((a, b) => a.username.localeCompare(b.username));

    contacts.forEach(contact => {
        const div = document.createElement('div');
        div.className = `list-group-item list-group-item-action contact-item d-flex justify-content-between align-items-center`;
        div.dataset.id = contact.id;

        if (selectedContactId === contact.id) {
            div.classList.add('active');
        }

        // Формируем телефонные номера
        let phoneHtml = '';
        if (contact.phone?.mobile || contact.phone?.home) {
            phoneHtml = '<div class="contact-phone">';
            if (contact.phone.mobile) {
                phoneHtml += `<i class="bi bi-phone me-1"></i>${contact.phone.mobile} `;
            }
            if (contact.phone.home) {
                phoneHtml += `<i class="bi bi-house me-1"></i>${contact.phone.home}`;
            }
            phoneHtml += '</div>';
        }

        div.innerHTML = `
            <div class="flex-grow-1" style="cursor:pointer">
                <div class="contact-name">${escapeHtml(contact.username)}</div>
                <div class="contact-email">${contact.email ? escapeHtml(contact.email) : '<span class="text-muted">нет email</span>'}</div>
                ${phoneHtml}
            </div>
            <div class="contact-actions">
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${contact.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${contact.id}">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        `;

        // Клик по самому элементу — выбираем контакт (подсветка)
        div.addEventListener('click', (e) => {
            // Если кликнули на кнопку — не делаем ничего (они обрабатываются отдельно)
            if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
            selectContact(contact.id);
        });

        // Кнопка "Редактировать"
        div.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            loadContactForEdit(contact.id);
        });

        // Кнопка "Удалить"
        div.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteContact(contact.id);
        });

        contactsList.appendChild(div);
    });
}

// Функция для загрузки контакта в форму (редактирование)
async function loadContactForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Контакт не найден');
        const contact = await response.json();

        // Заполняем форму
        contactId.value = contact.id;
        usernameInput.value = contact.username || '';
        emailInput.value = contact.email || '';
        mobileInput.value = contact.phone?.mobile || '';
        homeInput.value = contact.phone?.home || '';

        // Меняем заголовок и кнопки
        formTitle.innerHTML = '<i class="bi bi-pencil-square"></i> Редактирование контакта';
        saveBtn.innerHTML = '<i class="bi bi-pencil"></i> Обновить';
        cancelBtn.style.display = 'inline-block';

        // Прокручиваем к форме
        document.querySelector('.col-md-5').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Не удалось загрузить контакт для редактирования', 'danger');
    }
}

// Функция для выбора контакта (подсветка)
function selectContact(id) {
    selectedContactId = id;
    // Перерендерим список, чтобы обновить активный класс
    fetchContacts().then(renderContacts);
}

// Функция для экранирования HTML (защита от XSS)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция для показа уведомлений (Toast)
function showToast(message, type = 'success') {
    // Простой способ показать уведомление — используем alert, но сделаем красивее
    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg`;
    toast.style.minWidth = '250px';
    toast.style.animation = 'fadeInUp 0.3s ease';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toastContainer.remove(), 400);
    }, 3000);
}

// --- CRUD операции ---

// 1. Создание или обновление контакта
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const contactData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: {
            mobile: mobileInput.value.trim(),
            home: homeInput.value.trim()
        }
    };

    // Валидация: имя обязательно
    if (!contactData.username) {
        showToast('Пожалуйста, введите имя контакта', 'warning');
        return;
    }

    const id = contactId.value;
    const isEditing = id !== '';

    try {
        let response;

        if (isEditing) {
            // PUT — обновление
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        } else {
            // POST — создание
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        }

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Ошибка при сохранении');
        }

        // Очищаем форму
        resetForm();

        // Показываем сообщение
        showToast(isEditing ? 'Контакт обновлён!' : 'Контакт создан!', 'success');

        // Обновляем список
        const contacts = await fetchContacts();
        renderContacts(contacts);

    } catch (error) {
        console.error('Ошибка:', error);
        showToast(error.message || 'Не удалось сохранить контакт', 'danger');
    }
});

// 2. Удаление контакта
async function deleteContact(id) {
    if (!confirm('Удалить этот контакт?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка при удалении');

        showToast('Контакт удалён', 'success');

        // Если удалили выбранный контакт — сбрасываем выбор
        if (selectedContactId === id) {
            selectedContactId = null;
        }

        const contacts = await fetchContacts();
        renderContacts(contacts);

    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Не удалось удалить контакт', 'danger');
    }
}

// 3. Удаление всех контактов
deleteAllBtn.addEventListener('click', async () => {
    const contacts = await fetchContacts();
    if (contacts.length === 0) {
        showToast('Список уже пуст', 'info');
        return;
    }

    if (!confirm('Удалить ВСЕ контакты?')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка при удалении');

        showToast('Все контакты удалены', 'success');
        selectedContactId = null;
        const newContacts = await fetchContacts();
        renderContacts(newContacts);

    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Не удалось удалить все контакты', 'danger');
    }
});

// 4. Отмена редактирования
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    contactForm.reset();
    contactId.value = '';
    formTitle.innerHTML = '<i class="bi bi-person-plus"></i> Новый контакт';
    saveBtn.innerHTML = '<i class="bi bi-save"></i> Сохранить';
    cancelBtn.style.display = 'none';
    selectedContactId = null;
    // Обновляем список, чтобы сбросить активный класс
    fetchContacts().then(renderContacts);
}

// --- Инициализация ---

// Загружаем контакты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchContacts().then(renderContacts);
});

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);