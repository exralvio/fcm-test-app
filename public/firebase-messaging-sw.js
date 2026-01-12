importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "***REMOVED***",
  authDomain: "***REMOVED***.firebaseapp.com",
  projectId: "***REMOVED***",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:2c962ffe8b245041e5594f"
});

const messaging = firebase.messaging();

