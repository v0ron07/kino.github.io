const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voting = sequelize.define('Voting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
Voting.associate = (models) => {
    Voting.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'Owner'
    });
    Voting.hasMany(models.Movie, {
        foreignKey: 'votingId',
        as: 'Movies'
    });
};
module.exports = Voting;