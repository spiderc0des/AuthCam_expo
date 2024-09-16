import 'react-native-gesture-handler'; 
import 'react-native-safe-area-context';
import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import AboutScreen from './screens/AboutScreen';
import CameraScreen from './screens/CameraScreen';
import AuthContext  from './AuthContext'
import { useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';



// Create navigators
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Authentication stack navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

// Drawer navigator
const DrawerNavigator = () => (
  <Drawer.Navigator initialRouteName="Camera">
    <Drawer.Screen name="Camera" component={CameraScreen} />
    <Drawer.Screen name="Profile" component={ProfileScreen}/>
    <Drawer.Screen name="About" component={AboutScreen} />
  </Drawer.Navigator>
);


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Manage authentication state
  const [cameraPermissionInfo, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
        requestPermissions();
  }, []);

  const requestPermissions = async () => {
      // Request camera permissions
      const cameraPermissionResponse = await requestCameraPermission();
      if (!cameraPermissionResponse.granted) {
          alert('Camera permissions are needed to take pictures.');
      }

        // Request media library permissions
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
            Alert.alert('Permission required', 'Media library permissions are needed to save pictures.');
        }
    }
  const navigationRef = useRef();

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated}}>
      <NavigationContainer>
        {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export default App;

