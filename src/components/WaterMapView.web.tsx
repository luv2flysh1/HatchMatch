import { StyleSheet, View, Text, Pressable, Linking } from 'react-native';
import { useCallback } from 'react';
import type { WaterBody } from '../types/database';

interface WaterMapViewProps {
  waters: (WaterBody & { distance?: number })[];
  onWaterPress: (water: WaterBody) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

// Web fallback - maps not supported on web
export function WaterMapView({ waters, onWaterPress }: WaterMapViewProps) {
  const handleOpenInMaps = useCallback((water: WaterBody) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${water.latitude},${water.longitude}`;
    Linking.openURL(url);
  }, []);

  if (waters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No waters to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>
        Interactive maps available on mobile. Tap to open in Google Maps.
      </Text>
      {waters.slice(0, 15).map((water) => (
        <Pressable
          key={water.id}
          style={styles.item}
          onPress={() => onWaterPress(water)}
        >
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{water.name}</Text>
            <Text style={styles.itemMeta}>
              {water.type} • {water.state}
              {water.distance !== undefined && ` • ${water.distance.toFixed(1)} mi`}
            </Text>
          </View>
          <Pressable
            style={styles.mapLink}
            onPress={(e) => {
              e.stopPropagation();
              handleOpenInMaps(water);
            }}
          >
            <Text style={styles.mapLinkText}>Map</Text>
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  mapLink: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapLinkText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
});
