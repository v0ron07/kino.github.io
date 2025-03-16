// URL бэкенда (замените на ваш URL)
const BACKEND_URL = '/api'; // Используем относительный URL (для GitHub Pages)

// Функция для отправки запросов к API
async function apiRequest(method, endpoint, data = null, requiresAuth = false) {
    const url = `${BACKEND_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Добавляем токен, если требуется аутентификация
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Если нет токена, перенаправляем на страницу входа
            window.location.href = '/login.html';
            return null; // Останавливаем выполнение
        }
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        // Обрабатываем ошибки HTTP статусов
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Удаляем токен и перенаправляем на страницу входа
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return null;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Ошибка ${response.status}`); // Выбрасываем ошибку для обработки в catch
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        alert(error.message); // Отображаем сообщение об ошибке
        return null;
    }
}

// Функции для аутентификации
async function register(username, password, email) {
    return apiRequest('POST', '/users/register', { username, password, email });
}

async function login(username, password) {
    const data = await apiRequest('POST', '/users/login', { username, password });
    if (data && data.token) {
        localStorage.setItem('token', data.token);
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Функции для работы с голосованиями
async function createVoting(title, description, isPublic) {
    return apiRequest('POST', '/votings', { title, description, isPublic }, true);
}

async function getVotings() {
    return apiRequest('GET', '/votings', null, true);
}

async function getVoting(votingId) {
    return apiRequest('GET', `/votings/${votingId}`, null, true);
}

async function addMovieToVoting(votingId, title) {
    return apiRequest('POST', `/votings/${votingId}/movies`, { title }, true);
}

async function voteForMovie(votingId, movieId) {
    return apiRequest('POST', `/votings/${votingId}/movies/${movieId}/vote`, null, true);
}