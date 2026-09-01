const http = require('http');

async function main() {
  const loginBody = JSON.stringify({ phone: '+998901234567', password: 'admin123' });

  const token = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginBody),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).accessToken));
    });
    req.on('error', reject);
    req.write(loginBody);
    req.end();
  });

  const seedLeads = [
    { fullName: 'Rustam Karimov', phone: '+998 94 333 44 55', source: 'Facebook', status: 'CONTACTED', amount: 3200000, notes: "Javob bermadi. 4-sinf suhbati uchun qo'ng'iroqqa javob bermadi" },
    { fullName: 'Bobur Shodiyev', phone: '+998 90 888 77 66', source: 'Telefon', status: 'CONTACTED', amount: 900000, notes: "Javob bermadi. Fullstack guruh bo'yicha javob bermadi" },
  ];

  for (const item of seedLeads) {
    await new Promise((resolve) => {
      const itemBody = JSON.stringify(item);
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/leads',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(itemBody),
          'Authorization': `Bearer ${token}`,
        },
      }, (res) => {
        console.log(`DB ga qo'shildi: ${item.fullName} (${res.statusCode})`);
        resolve();
      });
      req.on('error', () => resolve());
      req.write(itemBody);
      req.end();
    });
  }
}

main().catch(console.error);
