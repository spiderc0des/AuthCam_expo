import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Button, Text, ActivityIndicator, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';



const CameraScreen = () => {
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [imageUri, setImageUri] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [verification, setVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const cameraRef = useRef(null);

    // const authToken = '34bf0d30fafbaf07ac836f7e5bce6a08b3ea09cf';

    useEffect(() => {
        requestPermission();
    }, []);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    // Function to get the stored token
    const getAuthToken = async () => {
        try {
        const token = await AsyncStorage.getItem('authToken');
        return token;
        } catch (error) {
        // console.error('Error fetching auth token:', error);
        }
    };

    const handleRetry = () => {
        setImageUri(null);
        setPreviewVisible(false);
        setVerification(false);
    };

    const verify = async (imageUri) => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setIsLoading(false);
            setMessage('No internet connection.');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 5000);
            return;
        }
        setIsLoading(true);

        try {
            const authToken = await getAuthToken();
            const response = await FileSystem.uploadAsync(
                `https://spidercodes.pythonanywhere.com/api/v1/verify/`,
                imageUri,
                {
                    fieldName: 'image',
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    headers: {
                        'Authorization': `Token ${authToken}`
                    },
                    mimeType: 'image/jpeg',
                }
            );
            setIsLoading(false);
            // console.log(response.body)
            const data = JSON.parse(response.body);
        
            if (response.status === 200) {
                // Successful retrieval and the media file is authentic
                Alert.alert("Authentic", `Image creator: ${data['Image creator']}\nTimestamp: ${data['Timestamp']}`);
            } else if (response.status === 412) {
                // Precondition failed, hash mismatch indicates modification
                Alert.alert("Modified", `Image creator: ${data['Image creator']}\nTimestamp: ${data['Timestamp']}`);
            } else if (response.status === 404) {
                // Media file not found
                Alert.alert("Not found", "Image not found.");
            }
        } catch (error) {
            setIsLoading(false);
            // console.error("Failed to process image:", error);
            setMessage('Error processing image: ' + error.message);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 5000);
        }
    };

    const handleProceed = async (imageUri) => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setIsLoading(false);
            setMessage('No internet connection.');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 5000);
            return;
        }
        setIsLoading(true);
    
        try {
            const authToken = await getAuthToken();
            const response = await FileSystem.uploadAsync(
                `https://spidercodes.pythonanywhere.com/api/v1/upload/`,
                imageUri,
                {
                    fieldName: 'image',
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    headers: {
                        'Authorization': `Token ${authToken}`
                    },
                    mimeType: 'image/jpeg',
                }
            );
    
            // console.log(response);
            const jsonResponse = JSON.parse(response.body);
            const imageUrl = jsonResponse.url;
    
            if (response.status !== 200) {
                throw new Error('Upload failed: ' + jsonResponse.error);
            }
    
            // Download the image from the URL
            const downloadRes = await FileSystem.downloadAsync(imageUrl, FileSystem.cacheDirectory + 'tempImage.jpg');
            if (downloadRes.status !== 200) {
                throw new Error(`Failed to download image: HTTP status ${downloadRes.status}`);
            }
    
            // Save the image to the camera roll
            const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
            const album = await MediaLibrary.getAlbumAsync('AuthCam');
            if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            } else {
                await MediaLibrary.createAlbumAsync('AuthCam', asset, false);
            }
    
            setIsLoading(false);
            setMessage('Image saved to gallery');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 3000);
            setPreviewVisible(false);
        } catch (error) {
            setIsLoading(false);
            // console.error("Failed to process image:", error);
            setMessage('Error processing image: ' + error.message);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 5000);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        // console.log(result);

        if (!result.cancelled) {
            const imageUri = result.assets[0].uri;
            verify(imageUri);
        } else {
            // console.error("Image picking was cancelled or no image was selected.");
        }
    };

    return (
        <View style={styles.container}>
            {!previewVisible ? (
                <View style={styles.container}>
                    <View style={styles.topIcon}>
                        
                    </View>
                    <CameraView style={styles.camera} ref={cameraRef} facing={facing} flash={flash}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={pickImage}>
                                <MaterialCommunityIcons name="folder-image" size={32} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={async () => {
                                const options = { quality: 0.5, base64: true, exif: true };
                                const data = await cameraRef.current.takePictureAsync(options);
                                setImageUri(data.uri);
                                setPreviewVisible(true);
                                
                            }}>
                                <MaterialCommunityIcons name="camera" size={32} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                                <MaterialCommunityIcons name="camera-switch" size={32} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleFlash} style={styles.flash}>
                            {flash === 'on' ? (
                                <MaterialCommunityIcons name="flash" size={20} color="white" />
                            ) : (
                                <MaterialCommunityIcons name="flash-off" size={20} color="grey" />
                            )}
                        </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.fullSizeImage} />
                    <View style={styles.buttonContainer}>
                        <Button title="Retry" style={styles.buttonStyle} onPress={handleRetry} />
                        <Button title="Proceed" style={styles.buttonStyle} onPress={() => handleProceed(imageUri)} />
                    </View>
                </View>
            )}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="grey" />
                </View>
            )}
            {showModal && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => {
                        setShowModal(false);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>{message}</Text>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default CameraScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        color: 'white',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        bottom: 0,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        width: '100%',
        padding: 20,
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.5)',  // semi-transparent background
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        bottom: 0,
    },
    fullSizeImage: {
        width: '100%',
        height: '100%',
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
    },
    modalView: {
        margin: 20,
        backgroundColor: 'grey',
        borderRadius: 5,
        padding: 10,              // Reduced padding
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalText: {
        textAlign: 'center',
        color: 'white'
    },
    flash: {
        left: 20,
        top: 10,
        padding: 0,
        margin: 0

    }
});
