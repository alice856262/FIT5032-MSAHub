// Initialize user data from localStorage
const userDataStore = JSON.parse(localStorage.getItem('userData')) || {};

// Save user data to local storage
const saveUserData = (email, data) => {
    userDataStore[email] = {
      ...data,
      userId: data.userId || email // Ensure userId is set
    };
    localStorage.setItem('userData', JSON.stringify(userDataStore));
};

// Get user data from local storage
const getUserData = (email) => {
  return userDataStore[email] || null;
};

// Check if the user exists in local storage
const userExists = (email) => {
  return !!userDataStore[email];
};

// Export functions for use in other components
export { saveUserData, getUserData, userExists };
