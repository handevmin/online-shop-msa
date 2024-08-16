const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/products',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/orders',
    createProxyMiddleware({
      target: 'http://localhost:8082',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/users',
    createProxyMiddleware({
      target: 'http://localhost:8083',
      changeOrigin: true,
    })
  );
};