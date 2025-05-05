const {STOCK_SYMBOLS} = require('./stocksNames');

const API_PREFIX = '/api';
const AUTH_ROUTE = `${API_PREFIX}/auth`;
const STOCK_ROUTE = `${API_PREFIX}/stocks`;
const PORTFOLIOS_ROUTE = `${API_PREFIX}/portfolios`;
const ACTIVES_ROUTE = `${API_PREFIX}/actives`;

module.exports = {API_PREFIX, AUTH_ROUTE, STOCK_SYMBOLS, STOCK_ROUTE, PORTFOLIOS_ROUTE, ACTIVES_ROUTE};