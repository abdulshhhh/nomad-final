const crypto = require('crypto');

const secret = 'supersecretkey'; // Replace with your actual key
const hash = crypto.createHash('sha512').update(secret).digest('hex');

console.log('SHA-512 Hash (512-bit):', hash);
