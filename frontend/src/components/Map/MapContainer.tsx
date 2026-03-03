import { useTheme } from '../../providers/ThemeProvider';
import { MapPin, AlertCircle } from 'lucide-react';

interface MapContainerProps {
  latitude?: number;
  longitude?: number;
  height?: string;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
  }>;
}

export default function MapContainer({
  latitude = 40.7128,
  longitude = -74.0060,
  height = 'h-96',
  markers = [],
}: MapContainerProps) {
  const { theme } = useTheme();

  return (
    <div className={`${height} rounded-xl overflow-hidden border border-border/20 ${
      theme === 'dark' ? 'bg-background' : 'bg-background'
    }`}>
      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-foreground/5 to-foreground/10">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Map View</h3>
            <p className="text-sm text-foreground/60 mb-4">
              Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Interactive map integration available with Mapbox, Leaflet, or Google Maps API</span>
          </div>

          {/* Markers list */}
          {markers.length > 0 && (
            <div className="mt-4 text-left text-sm">
              <p className="text-foreground/60 font-medium mb-2">Locations:</p>
              <ul className="space-y-1 text-foreground/80">
                {markers.map((marker) => (
                  <li key={marker.id} className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    {marker.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}