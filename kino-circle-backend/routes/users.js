const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user'); // Путь к модели User
const router = express.Router();
const jwtSecret = 'ваша_секретная_фраза'; // Замените на сложную строку

// Регистрация пользователя
router.post(
    '/register',
    [
        body('username', 'Имя пользователя должно быть длиной от 3 до 20 символов')
            .isLength({ min: 3, max: 20 }),
        body('email', 'Неверный формат email').isEmail(),
        body('password', 'Пароль должен быть длиной от 6 до 30 символов')
            .isLength({ min: 6, max: 30 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, password, email } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10); // Хэшируем пароль
            const user = await User.create({
                username,
                password: hashedPassword,
                email
            });

            // Создаем JWT токен
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
            res.status(201).json({ message: 'Пользователь зарегистрирован', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при регистрации' });
        }
    }
);

// Вход пользователя
router.post(
    '/login',
    [
        body('username', 'Имя пользователя обязательно').notEmpty(),
        body('password', 'Пароль обязателен').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username } });

            if (!user) {
                return res.status(400).json({ message: 'Неверные учетные данные' });
            }

            // Проверяем пароль
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Неверные учетные данные' });
            }

            // Создаем JWT токен
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
            res.json({ message: 'Вход выполнен', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при входе' });
        }
    }
);

// Получение профиля пользователя (требуется аутентификация)
router.get('/profile', /*authenticateToken,*/ async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json({ username: user.username, email: user.email }); // Возвращаем только необходимые данные
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
});

module.exports = router;