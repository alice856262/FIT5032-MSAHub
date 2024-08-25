import { ref } from 'vue';
import router from '../router'
import { doc, getDoc} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const currentUser = ref(null);
const userType = ref(null);
const isAuthenticated = ref(false);

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser.value = user;
    isAuthenticated.value = true;
  } else {
    currentUser.value = null;
    isAuthenticated.value = false;
  }
});

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', auth.currentUser);

    // Fetch user type from Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        userType.value = userDoc.data().userType;
        console.log('User type:', userType.value);
    } else {
        console.error('No such document!');
    }
    router.push('/profile');
    } catch (error) {
    console.error('Error logging in:', error.message);
  }
};

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    console.log('User logged in with Google:', auth.currentUser);
    router.push('/profile');
  } catch (error) {
    console.error('Error logging in with Google:', error.message);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    router.push('/');
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
};

export function useAuth() {
  return { isAuthenticated, currentUser, userType, login, loginWithGoogle, logout };
}



// const isAuthenticated = ref(false);
// const user = ref({});

// export function useAuth() {
//   const fetchUserData = async () => {
//     try {
//       const response = await fetch('/src/assets/json/userData.json');
//       const data = await response.json();
//       user.value = data.user;
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   const login = async (email, password) => {
//     await fetchUserData();

//     if (email === user.value.email && password === user.value.password) {
//       isAuthenticated.value = true;
//       router.push('/profile');
//     } else {
//       alert('Invalid credentials');
//     }
//   };

//   const logout = () => {
//     isAuthenticated.value = false;
//     router.push('/');
//   };

//   return { isAuthenticated, login, logout };
// }
