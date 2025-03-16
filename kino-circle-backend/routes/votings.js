const express = require('express');
const { body, validationResult } = require('express-validator');
const Voting = require('../models/voting'); // Путь к модели Voting
const Movie = require('../models/movie'); // Путь к модели Movie
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = 'ваша_секретная_фраза'; // Замените на сложную строку

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Нет токена
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Неверный токен
        }

        req.user = user;
        next();
    });
}

// Создание голосования (требуется аутентификация)
router.post(
    '/',
    authenticateToken,
    [
        body('title', 'Название голосования обязательно').notEmpty().trim().escape(),
        body('description', 'Описание должно быть длиной до 200 символов').isLength({ max: 200 }).trim().escape(),
        body('isPublic', 'Неверный формат значения для isPublic').isBoolean()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, description, isPublic } = req.body;
            const voting = await Voting.create({
                title,
                description,
                isPublic,
                ownerId: req.user.userId // ID пользователя из JWT
            });
            res.status(201).json({ message: 'Голосование создано', voting });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при создании голосования' });
        }
    }
);

// Получение списка голосований (требуется аутентификация)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const votings = await Voting.findAll({ where: { ownerId: req.user.userId } }); // Только голосования текущего пользователя
        res.json(votings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списка голосований' });
    }
});

// Получение конкретного голосования (требуется аутентификация)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const voting = await Voting.findOne({
            where: {
                id: req.params.id,
                ownerId: req.user.userId
            },
            include: [Movie] // Включаем фильмы, связанные с голосованием
        });

        if (!voting) {
            return res.status(404).json({ message: 'Голосование не найдено' });
        }

        res.json(voting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении голосования' });
    }
});

// Добавление фильма в голосование (требуется аутентификация)
router.post(
    '/:votingId/movies',
    authenticateToken,
    [
        body('title', 'Название фильма обязательно').notEmpty().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { votingId } = req.params;
            const { title } = req.body;

            const voting = await Voting.findOne({
                where: {
                    id: votingId,
                    ownerId: req.user.userId
                }
            });

            if (!voting) {
                return res.status(404).json({ message: 'Голосование не найдено' });
            }

            const movie = await Movie.create({
                title,
                votingId
            });
            res.status(201).json({ message: 'Фильм добавлен', movie });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при добавлении фильма' });
        }
    }
);
//Голосование за фильм (требуется аутентификация)
router.post('/:votingId/movies/:movieId/vote', authenticateToken, async (req, res) => {
    try {
        const { votingId, movieId } = req.params;

        const voting = await Voting.findOne({
            where: {
                id: votingId,
                ownerId: req.user.userId
            }
        });

        if (!voting) {
            return res.status(404).json({ message: 'Голосование не найдено' });
        }

        const movie = await Movie.findOne({
            where: {
                id: movieId,
                votingId: votingId
            }
        });

        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }

        movie.votes++;
        await movie.save();

        res.json({ message: 'Голос учтен', movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при голосовании' });
    }
});

module.exports = router;