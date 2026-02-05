import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, borderRadius, shadows, layout } from '../../theme';
import type { SkillLevel } from '../../types/database';

export default function ProfileScreen() {
  const {
    user, profile, isLoading,
    signIn, signUp, signOut, resetPassword, resetPasswordSent, updateProfile,
  } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState<SkillLevel>('beginner');
  const [editError, setEditError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!password && !isForgotPassword) {
      setError('Please enter your password');
      return;
    }

    if (!isForgotPassword && password.length < 6) {
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

  const handleForgotPassword = async () => {
    setError(null);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const startEditing = () => {
    setEditName(profile?.name || '');
    setEditSkillLevel(profile?.skill_level || 'beginner');
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const saveProfile = async () => {
    setEditError(null);
    const { error } = await updateProfile({
      name: editName.trim() || null,
      skill_level: editSkillLevel,
    });

    if (error) {
      setEditError(error.message);
    } else {
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome to HatchMatch</Text>
          <Text style={styles.subtitle}>
            {isForgotPassword
              ? 'Enter your email to receive a password reset link.'
              : isSignUp
                ? 'Create an account to save trips and get personalized recommendations.'
                : 'Sign in to access your trips and favorites.'
            }
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {resetPasswordSent && isForgotPassword && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.successText}>Check your email for a password reset link</Text>
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
            placeholderTextColor={colors.neutral[400]}
          />

          {!isForgotPassword && (
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.neutral[400]}
            />
          )}

          <Pressable
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={isForgotPassword ? handleForgotPassword : handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isForgotPassword
                ? 'Send Reset Link'
                : isSignUp
                  ? 'Create Account'
                  : 'Sign In'
              }
            </Text>
          </Pressable>

          {!isForgotPassword && !isSignUp && (
            <Pressable
              style={styles.linkButton}
              onPress={() => {
                setIsForgotPassword(true);
                setError(null);
              }}
            >
              <Text style={styles.linkButtonText}>Forgot Password?</Text>
            </Pressable>
          )}

          {isForgotPassword ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setIsForgotPassword(false);
                setError(null);
                useAuthStore.setState({ resetPasswordSent: false });
              }}
            >
              <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
            </Pressable>
          ) : (
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
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Logged in view
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editSection}>
              {editError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{editError}</Text>
                </View>
              )}
              <Text style={styles.editLabel}>Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.neutral[400]}
                autoCapitalize="words"
              />

              <Text style={styles.editLabel}>Skill Level</Text>
              <View style={styles.skillPills}>
                {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                  <Pressable
                    key={level}
                    style={[
                      styles.skillPill,
                      editSkillLevel === level && styles.skillPillActive,
                    ]}
                    onPress={() => setEditSkillLevel(level)}
                  >
                    <Text style={[
                      styles.skillPillText,
                      editSkillLevel === level && styles.skillPillTextActive,
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.editActions}>
                <Pressable style={styles.saveButton} onPress={saveProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={cancelEditing}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profile?.name || 'Angler'}</Text>
                <Pressable style={styles.editButton} onPress={startEditing}>
                  <Ionicons name="pencil-outline" size={16} color={colors.primary[500]} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>
                    {profile?.tier === 'premium' ? 'Premium' : 'Free'} Account
                  </Text>
                </View>
                {profile?.skill_level && (
                  <View style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>
                      {profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Favorites will be available in a future update.')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>My Favorites</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Catch Reports will be available in a future update.')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="fish-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Catch Reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Settings will be available in a future update.')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
          </Pressable>
          {profile?.tier !== 'premium' && (
            <Pressable style={[styles.menuItem, styles.upgradeItem]} onPress={() => Alert.alert('Coming Soon', 'Premium subscriptions will be available in a future update.')}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="star-outline" size={20} color={colors.accent[600]} />
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.accent[500]} />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Auth styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: colors.error.main,
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: colors.success.light,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  successText: {
    color: colors.success.main,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.input,
    padding: spacing[3.5],
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing[3],
    color: colors.text.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: spacing[3],
    alignItems: 'center',
  },
  linkButtonText: {
    color: colors.primary[500],
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    padding: spacing[3],
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary[500],
    fontSize: 14,
    fontWeight: '500',
  },
  // Profile styles
  profileHeader: {
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 32,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  editButtonText: {
    fontSize: 13,
    color: colors.primary[500],
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  tierBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.chip,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
  },
  skillBadge: {
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.chip,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary[600],
  },
  // Edit mode
  editSection: {
    width: '100%',
    paddingHorizontal: spacing[4],
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing[1.5],
    marginTop: spacing[3],
  },
  editInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.input,
    padding: spacing[3],
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    color: colors.text.primary,
  },
  skillPills: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  skillPill: {
    flex: 1,
    paddingVertical: spacing[2.5],
    alignItems: 'center',
    borderRadius: borderRadius.buttonPill,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  skillPillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  skillPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  skillPillTextActive: {
    color: colors.text.inverse,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[5],
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  // Menu
  menuSection: {
    marginTop: spacing[4],
  },
  menuItem: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  upgradeItem: {
    backgroundColor: colors.accent[50],
  },
  upgradeText: {
    fontSize: 16,
    color: colors.accent[700],
    fontWeight: '600',
  },
  signOutButton: {
    margin: spacing[4],
    padding: spacing[4],
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  signOutButtonText: {
    color: colors.error.main,
    fontSize: 16,
    fontWeight: '600',
  },
});
