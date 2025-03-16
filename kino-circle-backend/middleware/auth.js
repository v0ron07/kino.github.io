const jwt = require('jsonwebtoken');
const jwtSecret = 'моя_секретная_фраза';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Требуется токен аутентификации' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Неверный токен' });
        }
        req.user = user; // Сохраняем данные пользователя в объект запроса
        next();
    });
};