const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    votingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Movie.associate = (models) => {
    Movie.belongsTo(models.Voting, {
        foreignKey: 'votingId',
        as: 'Voting'
    });
};

module.exports = Movie;