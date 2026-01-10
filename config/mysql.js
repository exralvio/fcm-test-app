class MySQLConnection {
  constructor() {
    this._models = null;
    this._sequelize = null;
  }

  getSequelize() {
    if (!this._sequelize) {
      // Lazy load models which initializes Sequelize
      const db = this.getModels();
      this._sequelize = db.sequelize;
    }
    return this._sequelize;
  }

  getModels() {
    if (!this._models) {
      // Lazy load models to avoid circular dependency at module load time
      this._models = require('../models');
      this._sequelize = this._models.sequelize;
    }
    return this._models;
  }

  async connect() {
    try {
      const sequelize = this.getSequelize();
      await sequelize.authenticate();
      console.log('MySQL connection established successfully');
      return true;
    } catch (error) {
      console.error('Unable to connect to MySQL database:', error);
      throw error;
    }
  }

  async sync(options = {}) {
    try {
      const sequelize = this.getSequelize();
      await sequelize.sync(options);
      console.log('Database synchronized successfully');
      return true;
    } catch (error) {
      console.error('Error synchronizing database:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const sequelize = this.getSequelize();
      await sequelize.authenticate();
      console.log('MySQL connection test successful');
      return true;
    } catch (error) {
      console.error('MySQL connection test failed:', error);
      return false;
    }
  }

  async query(sql, options = {}) {
    try {
      const sequelize = this.getSequelize();
      const [results, metadata] = await sequelize.query(sql, options);
      return { results, metadata };
    } catch (error) {
      console.error('Sequelize query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    try {
      const sequelize = this.getSequelize();
      return await sequelize.transaction(callback);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  async close() {
    try {
      const sequelize = this.getSequelize();
      if (sequelize) {
        await sequelize.close();
        this._sequelize = null;
        this._models = null;
        console.log('MySQL connection closed');
      }
    } catch (error) {
      console.error('Error closing MySQL connection:', error);
      throw error;
    }
  }
}

module.exports = new MySQLConnection();

