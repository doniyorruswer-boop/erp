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
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).accessToken);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(loginBody);
    req.end();
  });

  const leadsToSeed = [
    // 1. MAKTAB (School) leads
    {
      fullName: 'Rustam Karimov',
      phone: '+998 94 333 44 55',
      source: 'Facebook',
      status: 'CONTACTED',
      amount: 3200000,
      notes: "4-sinf uchun suhbatga chaqirildi. Ota-onasi: Anvar Karimov",
    },
    {
      fullName: 'Shahzod Aliyev',
      phone: '+998 97 123 99 88',
      source: 'Instagram',
      status: 'NEW',
      amount: 3200000,
      notes: "1-sinf qabuli bo'yicha veb-saytdan ariza qoldirdi",
    },
    {
      fullName: 'Madina Umarova',
      phone: '+998 90 777 66 55',
      source: 'Tanishlar',
      status: 'TRIAL_BOOKED',
      amount: 3200000,
      notes: "7-sinf ingliz tili chuqurlashtirilgan sinf uchun sinov darsi",
    },

    // 2. BOG'CHA (Kindergarten) leads
    {
      fullName: 'Imronbek Zokirov',
      phone: '+998 93 555 11 22',
      source: 'Instagram',
      status: 'NEW',
      amount: 1800000,
      notes: "Kichkintoylar guruhi (2-3 yosh). Ota-onasi: Dilfuza Zokirova",
    },
    {
      fullName: 'Yasmina Karimova',
      phone: '+998 99 888 33 44',
      source: 'Telegram',
      status: 'CONTACTED',
      amount: 1800000,
      notes: "Mittivoylar guruhi (3-4 yosh) uchun ariza topshirildi",
    },
    {
      fullName: 'Biloliddin Saidxonov',
      phone: '+998 91 444 77 99',
      source: 'Tanishlar',
      status: 'TRIAL_BOOKED',
      amount: 1800000,
      notes: "Maktabga tayyorlov guruhi (6-7 yosh) uchun ekskursiya belgilandi",
    },

    // 3. O'QUV MARKAZI (Course Center) leads
    {
      fullName: 'Bobur Shodiyev',
      phone: '+998 90 888 77 66',
      source: 'Telefon',
      status: 'CONTACTED',
      amount: 900000,
      notes: "Fullstack dasturlash kursi bo'yicha ma'lumot oldi",
    },
    {
      fullName: 'Fotima Saidova',
      phone: '+998 90 111 22 33',
      source: 'Telegram',
      status: 'NEW',
      amount: 750000,
      notes: "General English va IELTS kursi bo'yicha ro'yxatdan o'tdi",
    },
    {
      fullName: 'Azizbek Qodirov',
      phone: '+998 94 888 12 34',
      source: 'Instagram',
      status: 'TRIAL_BOOKED',
      amount: 850000,
      notes: "Grafik Dizayn (UI/UX) ochiq darsiga yozildi",
    },
  ];

  for (const item of leadsToSeed) {
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
        console.log(`Lid qo'shildi: ${item.fullName} (${res.statusCode})`);
        resolve();
      });
      req.on('error', () => resolve());
      req.write(itemBody);
      req.end();
    });
  }

  console.log("Barcha muassasa turlari uchun lidlar bazaga yuklandi!");
}

main().catch(console.error);
