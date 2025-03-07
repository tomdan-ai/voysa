module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define('Token', {
      tokenId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contractAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      launchTimestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      websiteUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
      timestamps: true,
    });
    
    return Token;
  };