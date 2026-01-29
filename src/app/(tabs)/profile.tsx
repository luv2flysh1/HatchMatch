import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user, profile, isLoading, signIn, signUp, signOut } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome to HatchMatch</Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Create an account to save trips and get personalized recommendations.'
              : 'Sign in to access your trips and favorites.'
            }
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />

          <Pressable
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"
              }
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in view
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{profile?.name || 'Angler'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>
              {profile?.tier === 'premium' ? 'Premium' : 'Free'} Account
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>My Favorites</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>Catch Reports</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          {profile?.tier !== 'premium' && (
            <Pressable style={[styles.menuItem, styles.upgradeItem]}>
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tierBadge: {
    marginTop: 12,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  menuSection: {
    marginTop: 16,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  upgradeItem: {
    backgroundColor: '#fefce8',
  },
  upgradeText: {
    fontSize: 16,
    color: '#ca8a04',
    fontWeight: '600',
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  signOutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
