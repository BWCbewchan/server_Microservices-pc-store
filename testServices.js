const axios = require('axios');

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
  { name: 'Product Service', url: 'http://localhost:3002/health' },
  { name: 'Order Service', url: 'http://localhost:3003/health' },
  { name: 'Payment Service', url: 'http://localhost:3004/health' },
  { name: 'Shipping Service', url: 'http://localhost:3005/health' },
  { name: 'Inventory Service', url: 'http://localhost:3006/health' },
  { name: 'Review Service', url: 'http://localhost:3007/health' }
];

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url);
      console.log(`✅ ${service.name} is running`);
    } catch (error) {
      console.log(`❌ ${service.name} is not responding: ${error.message}`);
    }
  }
}

checkServices();