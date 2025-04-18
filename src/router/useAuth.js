import { ref } from 'vue';
import router from '../router';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const currentUser = ref(null);
const userType = ref(null);
const isAuthenticated = ref(false);

// Monitor the authentication state of the user
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser.value = user;
    isAuthenticated.value = true;

    // Fetch user type from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      userType.value = userDoc.data().userType; // Ensure userType is set correctly
      currentUser.value.firstName = userDoc.data().firstName; // Adding firstName to currentUser
      currentUser.value.lastName = userDoc.data().lastName; // Adding lastName to currentUser
      currentUser.value.reason = userDoc.data().reason; // Adding reason to currentUser
    } else {
      console.error('User document not found!');
    }
  } else {
    currentUser.value = null;
    userType.value = null;
    isAuthenticated.value = false;
  }
});

// Use signInWithEmailAndPassword() from Firebase Auth to authenticate the user
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
    console.error("Error logging in:", error.message);
    alert("Login failed. Please check your email/password and try again.");
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

// Use signOut() from Firebase Auth to sign the user out
const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    
    // Reset user-related states after logout
    currentUser.value = null;
    userType.value = null;
    isAuthenticated.value = false;

    router.push('/');
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
};

export function useAuth() {
  return { isAuthenticated, currentUser, userType, login, loginWithGoogle, logout };
}



// // ------- Only for Basic Auth -------
// import { getUserData, saveUserData, userExists } from '../config/userDataStore.js';

// const currentUser = ref(null);
// const isAuthenticated = ref(false);
// const userType = ref(null);

// // Check for existing user session on page load
// if (sessionStorage.getItem('currentUser')) {
//   currentUser.value = JSON.parse(sessionStorage.getItem('currentUser'));
//   isAuthenticated.value = true;
//   userType.value = currentUser.value.email;
// }

// const login = (email, password) => {
//   const user = getUserData(email);
//   if (user && user.password === password) {
//     currentUser.value = {
//       ...user,
//       userId: user.userId || email // Ensure userId is set, fall back to email if needed
//     };
//     isAuthenticated.value = true;
//     userType.value = currentUser.value.email;
//     console.log('userType:', userType.value);

//     // Save the logged-in user's data to sessionStorage
//     sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value));

//     router.push('/profile');
//   } else {
//     alert('Invalid credentials');
//   }
// };

// const register = (userData) => {
//   if (userExists(userData.email)) {
//     alert('User already exists with this email.');
//   } else {
//     saveUserData(userData.email, userData);
//     // currentUser.value = userData;
//     // isAuthenticated.value = true;
//     // userType.value = currentUser.value.email;
//     // console.log('User registered and logged in:', currentUser.value);
//     router.push('/login');
//   }
// };

// const logout = () => {
//   currentUser.value = null;
//   isAuthenticated.value = false;
//   userType.value = null;
//   sessionStorage.removeItem('currentUser');  // Remove user data from sessionStorage to end the session
//   router.push('/');
// };

// // Return an object containing all the authentication-related state and functions for use in other components
// export function useAuth() {
//   return { isAuthenticated, userType, currentUser, login, register, logout };
// }
// // ------- Only for Basic Auth -------