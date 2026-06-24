importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCRggV3O8_3Xz71bmPJ1tyN4OUya56bKN8',
  authDomain: 'fogon-94839.firebaseapp.com',
  projectId: 'fogon-94839',
  storageBucket: 'fogon-94839.firebasestorage.app',
  messagingSenderId: '522783799807',
  appId: '1:522783799807:web:0ebfd4d6a48b6e44dd4fca'
})

const messaging = firebase.messaging()

// Notificaciones cuando la app está en segundo plano
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'Fogón', {
    body: body ?? '',
    icon: icon ?? '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: payload.data
  })
})