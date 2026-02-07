import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface VoiceInputProps {
  onResult: (text: string) => void;
  lang?: string;
  style?: any;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  lang = 'es-ES',
  style,
}) => {
  const [recognizing, setRecognizing] = useState(false);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      onResult(event.results[0].transcript);
    }
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message);
    setRecognizing(false);
  });

  const handlePress = async () => {
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      alert('Microphone/Speech Recognition permission is required');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, recognizing && styles.recognizing, style]}
    >
      <View style={styles.iconContainer}>
        {recognizing ? (
          <ActivityIndicator color='#fff' size='small' />
        ) : (
          <View style={styles.micIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  recognizing: {
    backgroundColor: '#d32f2f',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    // Minimal "mic" representation
  },
});
