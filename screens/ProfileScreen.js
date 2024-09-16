import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../AuthContext';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Use navigation inside the component
  const { setIsAuthenticated } = useContext(AuthContext); // Use AuthContext

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername);
      } catch (error) {
        // console.error('Failed to fetch username from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('authToken'); // Remove the token on logout
    setIsAuthenticated(false);
    // navigation.replace('Login'); // Navigate to Login screen after logout
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/spider_no_bg.png')}
        style={styles.userIcon}
      />
      {username && <Text style={styles.usernameText}>Username: {username}</Text>}
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

