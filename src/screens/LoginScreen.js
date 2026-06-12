import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { validUser, validGRNUser } from '../constants/auth';
import { styles } from '../constants/styles';

export function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.trim() === validUser.username && password === validUser.password) {
      setError('');
      navigation.replace('Dashboard', { user: username.trim() });
      return;
    }
    if (username.trim() === validGRNUser.username && password === validGRNUser.password) {
      setError('');
      navigation.replace('GRNDashboard');
      return;
    }
    setError('Invalid username or password.');
  };

  return (
    <SafeAreaView style={styles.loginScreen}>
      <StatusBar style="dark" />
      <View style={styles.loginCard}>
        <Text style={styles.brandText}>Tia-Asset</Text>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSubtitle}>Sign in to continue to the portal.</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Demo - username: nurse · password: 1234
            Demo - username: grn · password: 4321
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
