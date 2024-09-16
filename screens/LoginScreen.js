import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../AuthContext';

const api = axios.create({
    baseURL: 'https://spidercodes.pythonanywhere.com',
});

export const loginUser = async (username, password) => {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/dj-rest-auth/login/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        // console.error('Login failed:', error);
        throw error;
    }
};

export const registerUser = async (username, password) => {
    try {
        const response = await api.post('/register/', {
            username,
            password1: password,
            password2: password
        });
        return response.data;
    } catch (error) {
        const errorMessage = Object.entries(error.response?.data || {})
            .map(([key, value]) => `${value.join(' ')}`)
            .join(' ');
        // console.error('Registration Failed:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getUser = async (token) => {
  try {
    const response = await api.get('/dj-rest-auth/user/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    // console.log("Response from getUser:", response.data);
    return response.data.username;  
  } catch (error) {
    // console.error("Failed to fetch user:", error.response?.data || error.message);
    throw error; 
  }
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const { setIsAuthenticated } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const data = await loginUser(username, password);
            if (data?.key) {
                setModalMessage('Login Successful!');
                setIsLoading(false);
                setShowModal(true);
                setIsAuthenticated(true);
                await AsyncStorage.setItem('authToken', data.key);
                try {
                    const username = await getUser(data.key);
                    // console.log("Logged in user:", username);
                    await AsyncStorage.setItem('username', username);
                } catch (getUserError) {
                    // console.error("Error getting user details:", getUserError);
                }
                setTimeout(() => {
                    setShowModal(false);
                    // navigation.navigate('Camera');
                }, 2000);
            } else {
                throw new Error('Login Failed! Incorrect Username or Password');
            }
        } catch (error) {
            setModalMessage(error.toString());
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 5000);
        } finally {
        }
    };

    const handleSignUp = async () => {
        setIsLoading(true);
        if (password !== confirmPassword) {
            setModalMessage('Passwords do not match!');
            setShowModal(true);
            setTimeout(() => setShowModal(false), 3000);
            setIsLoading(false)
            return;
        }
        else {
          try {
              const data = await registerUser(username, password);
              setModalMessage('Registration successful!');
              setShowModal(true);
              setTimeout(() => {
                  setShowModal(false);
              }, 2000);
              toggleMode();
          } catch (error) {
              setModalMessage(error.toString());
              setShowModal(true);
              setTimeout(() => {
                  setShowModal(false);
              }, 5000);
          } finally {
              setIsLoading(false);
          }
        }
    };

    const toggleMode = () => {
      setIsLogin(prevIsLogin => !prevIsLogin);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.logoContainer}>
              <Image source={require('../assets/login_image.png')} style={styles.logo} />
              <Text style={styles.mottoText}>Reducing Digital Deception</Text>
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />
                {!isLogin && (
                    <TextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                )}
            </View>

            {
              isLogin ? (
                  <View style={styles.buttonContainer}>
                      <TouchableOpacity onPress={handleLogin} style={styles.button}>
                          <Text style={styles.buttonText}>Login</Text>
                      </TouchableOpacity>
                  </View>
              ) : (
                  <View style={styles.buttonContainer}>
                      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
                          <Text style={styles.buttonText}>Register</Text>
                      </TouchableOpacity>
                  </View>
              )
            }
            
            <TouchableOpacity onPress={toggleMode} style={styles.textButton}>
                <Text style={styles.text}>{isLogin ? 'Register' : 'Back to Login'}</Text>
            </TouchableOpacity>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                    </View>
                </View>
            </Modal>
            <Text style={styles.spiderCodes}>{"spidercodes <🕷️/>"}</Text>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    mottoText: {
      color: 'black',
      fontWeight: '700',
      fontSize: 16,
   },
    textButton: {
        marginTop: 15,
    },
    text: {
        color: '#0782F9',
        fontWeight: '700',
    },
    logoContainer: {
      marginBottom: 20,
      alignItems: 'center',  // Center the logo container
    },
    logo: {
      width: 150,  // Set the width of the logo
      height: 150,  // Set the height of the logo
      resizeMode: 'contain',  // Ensure the aspect ratio is maintained
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'grey',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: '80%',
    },
    modalText: {
        textAlign: 'center',
        color: 'white',
    },
    spiderCodes: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      fontSize: 14,
      color: 'gray',
    }
});

export default LoginScreen;
