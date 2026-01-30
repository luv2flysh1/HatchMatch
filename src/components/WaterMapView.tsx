import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCallback, useMemo, useRef } from 'react';
import type { WaterBody } from '../types/database';

interface WaterMapViewProps {
  waters: (WaterBody & { distance?: number })[];
  onWaterPress: (water: WaterBody) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function WaterMapView({ waters, onWaterPress, userLocation }: WaterMapViewProps) {
  const mapRef = useRef<MapView>(null);

  // Calculate region to fit all markers
  const region = useMemo(() => {
    if (waters.length === 0) {
      return {
        latitude: 39.8283,
        longitude: -98.5795,
        latitudeDelta: 30,
        longitudeDelta: 30,
      };
    }

    const lats = waters.map(w => w.latitude);
    const lngs = waters.map(w => w.longitude);

    if (userLocation) {
      lats.push(userLocation.latitude);
      lngs.push(userLocation.longitude);
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latDelta = Math.max((maxLat - minLat) * 1.3, 0.5);
    const lngDelta = Math.max((maxLng - minLng) * 1.3, 0.5);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [waters, userLocation]);

  const handleMarkerPress = useCallback((water: WaterBody) => {
    onWaterPress(water);
  }, [onWaterPress]);

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'river':
        return '#2563eb';
      case 'lake':
        return '#0891b2';
      case 'stream':
        return '#3b82f6';
      case 'creek':
        return '#06b6d4';
      default:
        return '#6b7280';
    }
  };

  if (waters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No waters to display on map</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {waters.map((water) => (
          <Marker
            key={water.id}
            coordinate={{
              latitude: water.latitude,
              longitude: water.longitude,
            }}
            pinColor={getMarkerColor(water.type)}
            title={water.name}
            description={`${formatWaterType(water.type)} • ${water.state}${water.distance !== undefined ? ` • ${formatDistance(water.distance)}` : ''}`}
          >
            <Callout onPress={() => handleMarkerPress(water)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{water.name}</Text>
                <Text style={styles.calloutMeta}>
                  {formatWaterType(water.type)} • {water.state}
                </Text>
                {water.distance !== undefined && (
                  <Text style={styles.calloutDistance}>
                    {formatDistance(water.distance)} away
                  </Text>
                )}
                {water.species && water.species.length > 0 && (
                  <Text style={styles.calloutSpecies}>
                    {water.species.slice(0, 3).join(', ')}
                  </Text>
                )}
                <Text style={styles.calloutTap}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
          <Text style={styles.legendText}>River</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0891b2' }]} />
          <Text style={styles.legendText}>Lake</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Stream</Text>
        </View>
      </View>
    </View>
  );
}

function formatWaterType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  callout: {
    padding: 8,
    minWidth: 150,
    maxWidth: 220,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  calloutMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  calloutDistance: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 2,
  },
  calloutSpecies: {
    fontSize: 11,
    color: '#059669',
    marginTop: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    fontStyle: 'italic',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#4b5563',
  },
});
