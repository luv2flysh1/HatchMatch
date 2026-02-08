import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../stores/tripStore';
import { colors, spacing, borderRadius, shadows, layout } from '../../theme';

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentTrip, updateTrip, deleteTrip, fetchTrip, isLoading } = useTripStore();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [editingStartDate, setEditingStartDate] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [dateInputError, setDateInputError] = useState<string | null>(null);

  useEffect(() => {
    if (id && !currentTrip) {
      fetchTrip(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentTrip) {
      setName(currentTrip.name);
      setStartDate(currentTrip.start_date);
      setEndDate(currentTrip.end_date || '');
      setHasEndDate(!!currentTrip.end_date);
      setNotes(currentTrip.notes || '');
    }
  }, [currentTrip]);

  const validateDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr + 'T00:00:00');
    return !isNaN(date.getTime());
  };

  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Please enter a trip name');
      return;
    }

    if (!validateDate(startDate)) {
      setError('Please enter a valid start date');
      return;
    }

    if (hasEndDate && endDate) {
      if (!validateDate(endDate)) {
        setError('Please enter a valid end date');
        return;
      }
      if (endDate < startDate) {
        setError('End date must be after start date');
        return;
      }
    }

    await updateTrip(id, {
      name: name.trim(),
      start_date: startDate,
      end_date: hasEndDate && endDate ? endDate : null,
      notes: notes.trim() || null,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(id);
            // Go back to trips list
            router.dismissAll();
            router.replace('/(tabs)/trips');
          },
        },
      ],
    );
  };

  const handleStartDateConfirm = () => {
    setDateInputError(null);
    if (validateDate(startDateInput)) {
      setStartDate(startDateInput);
      setEditingStartDate(false);
    } else {
      setDateInputError('Enter date as YYYY-MM-DD (e.g., 2026-03-15)');
    }
  };

  const handleEndDateConfirm = () => {
    setDateInputError(null);
    if (validateDate(endDateInput)) {
      setEndDate(endDateInput);
      setEditingEndDate(false);
    } else {
      setDateInputError('Enter date as YYYY-MM-DD (e.g., 2026-03-15)');
    }
  };

  if (!currentTrip) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>Edit Trip</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Trip Name */}
          <Text style={styles.label}>Trip Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Trip name"
            placeholderTextColor={colors.neutral[400]}
          />

          {/* Start Date */}
          <Text style={styles.label}>Start Date *</Text>
          {editingStartDate ? (
            <View>
              <TextInput
                style={[styles.input, dateInputError && styles.inputError]}
                value={startDateInput}
                onChangeText={(text) => {
                  setStartDateInput(text);
                  setDateInputError(null);
                }}
                placeholder="YYYY-MM-DD (e.g., 2026-03-15)"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numbers-and-punctuation"
                autoFocus
                onSubmitEditing={handleStartDateConfirm}
              />
              {dateInputError && (
                <Text style={styles.dateInputError}>{dateInputError}</Text>
              )}
              <Pressable style={styles.confirmDateButton} onPress={handleStartDateConfirm}>
                <Text style={styles.confirmDateButtonText}>Confirm Date</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.dateButton}
              onPress={() => {
                setStartDateInput(startDate);
                setEditingStartDate(true);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.dateButtonText}>
                {startDate ? formatDateForDisplay(startDate) : 'Select date'}
              </Text>
              <Ionicons name="pencil-outline" size={14} color={colors.neutral[400]} />
            </Pressable>
          )}

          {/* End Date */}
          {!hasEndDate ? (
            <Pressable
              style={styles.addEndDateButton}
              onPress={() => {
                setHasEndDate(true);
                if (!endDate) {
                  const d = new Date(startDate + 'T00:00:00');
                  d.setDate(d.getDate() + 1);
                  setEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                }
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary[500]} />
              <Text style={styles.addEndDateText}>Add end date</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.endDateHeader}>
                <Text style={styles.label}>End Date</Text>
                <Pressable onPress={() => { setHasEndDate(false); setEndDate(''); }}>
                  <Text style={styles.removeEndDate}>Remove</Text>
                </Pressable>
              </View>
              {editingEndDate ? (
                <View>
                  <TextInput
                    style={[styles.input, dateInputError && styles.inputError]}
                    value={endDateInput}
                    onChangeText={(text) => {
                      setEndDateInput(text);
                      setDateInputError(null);
                    }}
                    placeholder="YYYY-MM-DD (e.g., 2026-03-15)"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numbers-and-punctuation"
                    autoFocus
                    onSubmitEditing={handleEndDateConfirm}
                  />
                  {dateInputError && (
                    <Text style={styles.dateInputError}>{dateInputError}</Text>
                  )}
                  <Pressable style={styles.confirmDateButton} onPress={handleEndDateConfirm}>
                    <Text style={styles.confirmDateButtonText}>Confirm Date</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    setEndDateInput(endDate);
                    setEditingEndDate(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
                  <Text style={styles.dateButtonText}>
                    {endDate ? formatDateForDisplay(endDate) : 'Select end date'}
                  </Text>
                  <Ionicons name="pencil-outline" size={14} color={colors.neutral[400]} />
                </Pressable>
              )}
            </>
          )}

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Trip notes..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>

          {/* Delete */}
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
            <Text style={styles.deleteButtonText}>Delete Trip</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[6],
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing[1.5],
    marginTop: spacing[4],
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.input,
    padding: spacing[3.5],
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    color: colors.text.primary,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: spacing[3],
  },
  dateButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.input,
    padding: spacing[3.5],
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  dateInputError: {
    color: colors.error.main,
    fontSize: 12,
    marginTop: spacing[1],
  },
  confirmDateButton: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
  confirmDateButtonText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '500',
  },
  addEndDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginTop: spacing[3],
    paddingVertical: spacing[2],
  },
  addEndDateText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  endDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeEndDate: {
    fontSize: 13,
    color: colors.error.main,
    fontWeight: '500',
    marginTop: spacing[4],
  },
  buttonRow: {
    marginTop: spacing[8],
    gap: spacing[3],
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    paddingVertical: spacing[4],
    alignItems: 'center',
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.tertiary,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[8],
    paddingVertical: spacing[3.5],
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  deleteButtonText: {
    color: colors.error.main,
    fontSize: 16,
    fontWeight: '600',
  },
});
