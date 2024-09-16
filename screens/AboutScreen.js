import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About AuthCam</Text>
      <Text style={styles.subtitle}>Purpose</Text>
      <Text style={styles.text}>
        AuthCam tackles the challenges posed by sophisticated image manipulation tools that compromise digital media's integrity and authenticity. By ensuring that each image captured through the app remains unaltered and any user who needs to verify the authenticity of images.{'\n'}
      </Text>
      <Text style={styles.subtitle}>How It Works</Text>
      <Text style={styles.text}>
        1. Capture: Use AuthCam to take photos directly through the app.{'\n'}
      </Text>
      <Text style={styles.text}>
        2. Hash Generation: Upon capture, AuthCam calculates a secure hash of the image.{'\n'}
      </Text>
      <Text style={styles.text}>
        3. Verification: To verify a file, simply open it through AuthCam.{'\n'}
      </Text>
      <Text style={styles.subtitle}>Key Features</Text>
      <Text style={styles.text}>
        1. Privacy-Focused: AuthCam stores only the UID and hash value of each image, ensuring that actual images are not stored to maintain user privacy and data security.{'\n'}
      </Text>
      <Text style={styles.text}>
        2. Integrity Checks: Uses advanced cryptographic techniques to verify that images have not been tampered with since their capture.{'\n'}
      </Text>
      <Text style={styles.text}>
        3. User-Friendly Interface: Designed for ease of use, allowing for straightforward operation with minimal technical knowledge.{'\n'}
      </Text>
      <Text style={styles.subtitle}>Getting Started</Text>
      <Text style={styles.text}>
        1. Download and Install.{'\n'}
      </Text>
      <Text style={styles.text}>
        2. Open and Capture: Launch the app and use the camera functionality to capture new images.{'\n'}
      </Text>
      <Text style={styles.text}>
        3. Verify: Select images received from gallery through the app to verify its authenticity.{'\n'}
      </Text>
      <Text style={styles.spiderCodes}>{"spidercodes <🕷️/>"}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    textAlign: 'justify',
    marginTop: 5,
  },
  spiderCodes: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    fontSize: 14,
    color: 'gray',
  }
});

export default AboutScreen;
