const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database'); // Подключаем sequelize

// Подключаем маршруты
const userRoutes = require('./routes/users');
const votingRoutes = require('./routes/votings');

const app = express();
const port = process.env.PORT || 6660;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключаем маршруты
app.use('/api/users', userRoutes);
app.use('/api/votings', votingRoutes);

// Синхронизация с базой данных (создание таблиц)
sequelize.sync()
    .then(() => {
        console.log('База данных синхронизирована.');
        app.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
    })
    .catch(err => {
        console.error('Ошибка синхронизации базы данных:', err);
    });