import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyCRggV3O8_3Xz71bmPJ1tyN4OUya56bKN8',
  authDomain: 'fogon-94839.firebaseapp.com',
  projectId: 'fogon-94839',
  storageBucket: 'fogon-94839.firebasestorage.app',
  messagingSenderId: '522783799807',
  appId: '1:522783799807:web:0ebfd4d6a48b6e44dd4fca',
  measurementId: 'G-PJJC29YXVV'
}

const VAPID_KEY = 'BFae93uxGDOwWmKcM6N4C0TppMJg7yrMVpoRfACZNrRnm_KByLSigCfIu__9kV2TK7NkyEtrGwab1MGECS8wDzw'

export const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    })
    return token
  } catch (err) {
    console.error('Error al solicitar permiso de notificaciones:', err)
    return null
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, callback)
}