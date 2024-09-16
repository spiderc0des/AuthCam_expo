import React from 'react';


const AuthContext = React.createContext({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    logout: async () => {
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('authToken'); // Remove the token on logout
      navigation.navigate('Login')
    }
  });


  export default AuthContext;