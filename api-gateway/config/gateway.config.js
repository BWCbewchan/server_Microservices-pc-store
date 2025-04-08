const routes = {
  auth: {
    port: 3004,
    routes: {
      '/auth/login': '/auth/login',
      '/auth/register': '/auth/register',
      '/auth/profile': '/auth/profile'
    }
  },
  products: {
    port: 4004,
    routes: {
      '/products': '/products',
      '/products/:id': '/products/:id',
      '/products/featured': '/products/featured',
      '/products/search': '/products/search',
      '/categories': '/categories'
    }
  },
  cart: {
    port: 4000,
    routes: {
      '/cart': '/cart',
      '/cart/add': '/cart/add',
      '/cart/update': '/cart/update',
      '/cart/remove/:productId': '/cart/remove/:productId'
    }
  },
  orders: {
    port: 3002,
    routes: {
      '/orders': '/orders',
      '/orders/:orderId': '/orders/:orderId',
      '/orders/user': '/orders/user',
      '/orders/:orderId/status': '/orders/:orderId/status'
    }
  },
  inventory: {
    port: 3006,
    routes: {
      '/inventory/:productId': '/inventory/:productId'
    }
  }
};

module.exports = routes;