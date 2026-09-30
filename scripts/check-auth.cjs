// Script to verify Firebase Auth state independently
const { initializeApp, getApps } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const cfg = require('../firebase-applet-config.json');

async function testAuth() {
  console.log('=== TEST A: Firebase App Initialization ===');
  const app = getApps().length === 0 ? initializeApp(cfg) : getApps()[0];
  console.log('✓ Firebase App Name:', app.name);
  console.log('✓ Project ID:', cfg.projectId);

  const auth = getAuth(app);
  console.log('✓ Auth Instance ready:', Boolean(auth));

  console.log('\n=== TEST B & C: Check Auth Provider & User ===');
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${cfg.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'donghoic1@gmail.com',
        password: 'dummy_test_check',
        returnSecureToken: true
      })
    });
    const data = await res.json();
    console.log('Identity Toolkit status:', res.status);
    if (data.error) {
      console.log('Error message from Firebase:', data.error.message);
      if (data.error.message === 'PASSWORD_LOGIN_DISABLED') {
        console.log('-> KẾT QUẢ KỸ THUẬT: Provider Email/Password đang TẮT trong Firebase Console (auth/operation-not-allowed).');
      } else if (data.error.message === 'EMAIL_NOT_FOUND') {
        console.log('-> KẾT QUẢ KỸ THUẬT: User donghoic1@gmail.com chưa tồn tại.');
      } else if (data.error.message === 'INVALID_PASSWORD' || data.error.message === 'INVALID_LOGIN_CREDENTIALS') {
        console.log('-> KẾT QUẢ KỸ THUẬT: User donghoic1@gmail.com ĐÃ TỒN TẠI và Email/Password Provider ĐÃ BẬT!');
      }
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }

  console.log('\n=== TEST CHECK USER EXISTENCE VIA PASSWORD RESET ===');
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${cfg.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: 'donghoic1@gmail.com'
      })
    });
    const data = await res.json();
    if (data.email) {
      console.log('✓ XÁC NHẬN: User donghoic1@gmail.com ĐÃ ĐƯỢC TẠO VÀ TỒN TẠI trong Firebase Auth!');
    } else {
      console.log('Password reset check error:', data);
    }
  } catch (e) {
    console.error(e);
  }
}

testAuth();
