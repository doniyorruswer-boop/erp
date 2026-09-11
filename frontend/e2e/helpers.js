let cachedAuth = null;

async function getAuthSession() {
  if (cachedAuth) return cachedAuth;
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eduhub.uz', password: 'admin123' }),
  });
  if (!res.ok) {
    throw new Error(`Login API failed with status ${res.status}`);
  }
  cachedAuth = await res.json();
  return cachedAuth;
}

async function setupAuthenticatedPage(page) {
  const auth = await getAuthSession();
  await page.addInitScript((data) => {
    localStorage.setItem('token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.organization) {
        localStorage.setItem('organization', JSON.stringify(data.user.organization));
        localStorage.setItem('businessType', data.user.organization.businessType || 'COURSE_CENTER');
      }
    }
  }, auth);
}

module.exports = { setupAuthenticatedPage, getAuthSession };
