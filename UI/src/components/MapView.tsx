import { MapPin, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';

interface MapViewProps {
  onCompareClick: () => void;
}

export function MapView({ onCompareClick }: MapViewProps) {
  return (
    <div className="relative w-full h-full min-h-96 bg-gray-100 rounded-xl overflow-hidden">
      {/* MapView/Container */}
      <div className="absolute inset-0">
        {/* MapView/Placeholder */}
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <MapPin className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <p className="text-base sm:text-lg font-medium">Interactive Map</p>
            <p className="text-sm mt-1 text-gray-400">Map visualization goes here</p>
          </div>
        </div>

        {/* MapView/Pins/Company */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* MapView/Pins/Company/Pin */}
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            {/* MapView/Pins/Company/Label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-md text-xs whitespace-nowrap border border-gray-200">
              Company Location
            </div>
          </div>
        </div>

        {/* MapView/Pins/Areas */}
        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg border border-white"></div>
        </div>
        
        <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg border border-white"></div>
        </div>
        
        <div className="absolute bottom-1/3 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg border border-white"></div>
        </div>
      </div>

      {/* MapView/Controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <Button
          onClick={onCompareClick}
          variant="secondary"
          size="sm"
          className="bg-white hover:bg-gray-50 shadow-md rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-sm"
        >
          {/* MapView/Controls/CompareButton/Icon */}
          <BarChart3 className="w-4 h-4 sm:mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Compare</span>
        </Button>
      </div>
    </div>
  );
}