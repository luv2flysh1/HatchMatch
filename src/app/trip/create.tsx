import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
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

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CreateTripScreen() {
  const router = useRouter();
  const { createTrip, isLoading } = useTripStore();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Simple date input editing
  const [editingStartDate, setEditingStartDate] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  const validateDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr + 'T00:00:00');
    return !isNaN(date.getTime());
  };

  const handleCreate = async () => {
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

    const tripId = await createTrip({
      name: name.trim(),
      start_date: startDate,
      end_date: hasEndDate && endDate ? endDate : null,
      notes: notes.trim() || null,
    });

    if (tripId) {
      router.replace(`/trip/${tripId}`);
    } else {
      const storeError = useTripStore.getState().error;
      setError(storeError || 'Failed to create trip. Please try again.');
    }
  };

  const handleStartDateConfirm = () => {
    if (validateDate(startDateInput)) {
      setStartDate(startDateInput);
    }
    setEditingStartDate(false);
  };

  const handleEndDateConfirm = () => {
    if (validateDate(endDateInput)) {
      setEndDate(endDateInput);
    }
    setEditingEndDate(false);
  };

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
          <Text style={styles.screenTitle}>Plan New Trip</Text>

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
            placeholder="Summer Montana Trip"
            placeholderTextColor={colors.neutral[400]}
            autoFocus
          />

          {/* Start Date */}
          <Text style={styles.label}>Start Date *</Text>
          {editingStartDate ? (
            <View style={styles.dateEditRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={startDateInput}
                onChangeText={setStartDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numbers-and-punctuation"
                autoFocus
                onBlur={handleStartDateConfirm}
                onSubmitEditing={handleStartDateConfirm}
              />
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
              <Text style={styles.dateButtonText}>{formatDateForDisplay(startDate)}</Text>
              <Ionicons name="pencil-outline" size={14} color={colors.neutral[400]} />
            </Pressable>
          )}

          {/* End Date Toggle */}
          {!hasEndDate ? (
            <Pressable
              style={styles.addEndDateButton}
              onPress={() => {
                setHasEndDate(true);
                if (!endDate) {
                  // Default end date to day after start
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
                <View style={styles.dateEditRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={endDateInput}
                    onChangeText={setEndDateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="numbers-and-punctuation"
                    autoFocus
                    onBlur={handleEndDateConfirm}
                    onSubmitEditing={handleEndDateConfirm}
                  />
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
            placeholder="Meeting at the trailhead at 6am..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.createButton, isLoading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text style={styles.createButtonText}>Create Trip</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
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
  dateEditRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dateInput: {
    flex: 1,
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
  createButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    paddingVertical: spacing[4],
    alignItems: 'center',
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
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
});
