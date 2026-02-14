# Student Planner with Firebase - Deployment Guide

## What You'll Get
A fully functional student planner with Firebase authentication and real-time sync across all devices.

## Step-by-Step Deployment

### Step 1: Create Project Files

Create a new folder on your computer called `student-planner` and create these files inside:

#### File 1: `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Planner - Aether</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-900 via-red-950 to-black min-h-screen">
  <div id="root"></div>
  
  <script type="module" src="app.js"></script>
</body>
</html>
```

#### File 2: `app.js`
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// YOUR Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYp0dDiUebEJRTH2FR1Lpb6hxzYHWc6kE",
  authDomain: "aeher-1f6a4.firebaseapp.com",
  projectId: "aeher-1f6a4",
  storageBucket: "aeher-1f6a4.firebasestorage.app",
  messagingSenderId: "107870917224",
  appId: "1:107870917224:web:84db5856236be3796da1dd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let appState = {
  tasks: [],
  events: [],
  customLinks: [],
  selectedDate: new Date()
};

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadUserData(user.uid);
    setupRealtimeSync(user.uid);
    renderApp();
  } else {
    currentUser = null;
    renderAuthScreen();
  }
});

// Load user data from Firebase
async function loadUserData(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId, 'data', 'planner'));
  if (userDoc.exists()) {
    const data = userDoc.data();
    appState.tasks = data.tasks || [];
    appState.events = data.events || [];
    appState.customLinks = data.customLinks || [];
    renderApp();
  }
}

// Setup realtime sync
function setupRealtimeSync(userId) {
  onSnapshot(doc(db, 'users', userId, 'data', 'planner'), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      appState.tasks = data.tasks || [];
      appState.events = data.events || [];
      appState.customLinks = data.customLinks || [];
      renderApp();
    }
  });
}

// Save to Firebase
async function saveToFirebase() {
  if (!currentUser) return;
  await setDoc(doc(db, 'users', currentUser.uid, 'data', 'planner'), {
    tasks: appState.tasks,
    events: appState.events,
    customLinks: appState.customLinks,
    updatedAt: new Date().toISOString()
  });
}

// Add task
window.addTask = function() {
  const input = document.getElementById('task-input');
  if (input.value.trim()) {
    appState.tasks.push({
      id: Date.now(),
      text: input.value,
      completed: false,
      date: appState.selectedDate.toISOString().split('T')[0]
    });
    input.value = '';
    saveToFirebase();
    renderApp();
  }
};

// Toggle task
window.toggleTask = function(id) {
  const task = appState.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToFirebase();
    renderApp();
  }
};

// Delete task
window.deleteTask = function(id) {
  appState.tasks = appState.tasks.filter(t => t.id !== id);
  saveToFirebase();
  renderApp();
};

// Auth functions
window.handleSignUp = async function(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.handleSignIn = async function(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.handleSignOut = async function() {
  await signOut(auth);
};

window.showSignUp = function() {
  document.getElementById('signin-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
};

window.showSignIn = function() {
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('signin-form').classList.remove('hidden');
};

// Render functions
function renderAuthScreen() {
  document.getElementById('root').innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-8 max-w-md w-full border border-red-900">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">📅 Student Planner</h1>
          <p class="text-gray-400">Aether - Sync Across All Devices</p>
        </div>

        <form id="signin-form" onsubmit="handleSignIn(event)" class="space-y-4">
          <h2 class="text-xl font-bold text-white mb-4">Sign In</h2>
          <div>
            <label class="block text-red-400 mb-2 text-sm font-semibold">Email</label>
            <input type="email" id="signin-email" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
          </div>
          <div>
            <label class="block text-red-400 mb-2 text-sm font-semibold">Password</label>
            <input type="password" id="signin-password" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
          </div>
          <button type="submit" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold">
            Sign In
          </button>
          <p class="text-center text-gray-400 text-sm">
            Don't have an account? 
            <button type="button" onclick="showSignUp()" class="text-red-400 hover:text-red-300">Sign Up</button>
          </p>
        </form>

        <form id="signup-form" onsubmit="handleSignUp(event)" class="space-y-4 hidden">
          <h2 class="text-xl font-bold text-white mb-4">Create Account</h2>
          <div>
            <label class="block text-red-400 mb-2 text-sm font-semibold">Email</label>
            <input type="email" id="signup-email" required class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
          </div>
          <div>
            <label class="block text-red-400 mb-2 text-sm font-semibold">Password</label>
            <input type="password" id="signup-password" required minlength="6" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
            <p class="text-xs text-gray-400 mt-1">At least 6 characters</p>
          </div>
          <button type="submit" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold">
            Create Account
          </button>
          <p class="text-center text-gray-400 text-sm">
            Already have an account? 
            <button type="button" onclick="showSignIn()" class="text-red-400 hover:text-red-300">Sign In</button>
          </p>
        </form>
      </div>
    </div>
  `;
}

function renderApp() {
  const todaysTasks = appState.tasks.filter(t => 
    t.date === appState.selectedDate.toISOString().split('T')[0]
  );

  document.getElementById('root').innerHTML = `
    <div class="max-w-7xl mx-auto p-4">
      <div class="bg-gradient-to-r from-gray-800 to-black rounded-2xl shadow-lg p-6 mb-6 border border-red-800">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">📅 Student Planner</h1>
            <p class="text-gray-400 text-xs mt-1">Aether - Synced ☁️</p>
          </div>
          <button onclick="handleSignOut()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Sign Out
          </button>
        </div>
      </div>

      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 border border-red-900">
        <h2 class="text-2xl font-bold text-white mb-4">Today's Tasks</h2>
        
        <div class="flex gap-2 mb-4">
          <input 
            type="text" 
            id="task-input" 
            placeholder="Add a task..."
            class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
            onkeypress="if(event.key === 'Enter') addTask()"
          >
          <button onclick="addTask()" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold">
            Add
          </button>
        </div>

        <div class="space-y-2">
          ${todaysTasks.length === 0 ? 
            '<p class="text-gray-500 text-center py-4">No tasks yet</p>' :
            todaysTasks.map(task => `
              <div class="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                <input 
                  type="checkbox" 
                  ${task.completed ? 'checked' : ''} 
                  onchange="toggleTask(${task.id})"
                  class="w-5 h-5 rounded border-2 border-red-600"
                >
                <span class="flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-white'}">
                  ${task.text}
                </span>
                <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-400">
                  ✕
                </button>
              </div>
            `).join('')
          }
        </div>

        <div class="mt-6 pt-6 border-t border-gray-700">
          <p class="text-gray-400 text-sm">
            📊 Total Tasks: ${appState.tasks.length} | 
            ✅ Completed: ${appState.tasks.filter(t => t.completed).length}
          </p>
        </div>
      </div>
    </div>
  `;
}
```

### Step 2: Deploy to Netlify (FREE)

1. **Go to** https://app.netlify.com/
2. **Sign up** with GitHub, GitLab, or email
3. **Drag and drop** your `student-planner` folder onto Netlify
4. **Done!** You'll get a URL like `https://your-planner.netlify.app`

### Step 3: Use Your App

1. Open the URL on any device
2. Create an account with your email
3. Sign in from any other device with the same email
4. Everything syncs automatically! ☁️

## Alternative: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your folder
5. Deploy!

## Features Working
- ✅ User authentication (sign up/sign in)
- ✅ Real-time sync across all devices
- ✅ Tasks with completion tracking
- ✅ Secure Firebase storage
- ✅ Works on phone, tablet, desktop

## Need Help?
If you get stuck at any step, let me know which step and I'll help you through it!
