import { DollarSign, Clock, Shield, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AreaCardProps {
  name: string;
  rent: string;
  commute: string;
  safety: string;
  safetyPercentile: number;
  lifestyle: string;
  reasoning: string;
}

export function AreaCard({ 
  name, 
  rent, 
  commute, 
  safety, 
  safetyPercentile,
  lifestyle, 
  reasoning 
}: AreaCardProps) {
  // Safety color based on percentile
  const getSafetyColor = (percentile: number) => {
    if (percentile < 33) return 'text-red-600';
    if (percentile < 66) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-fit">
      <CardHeader className="pb-3 flex-shrink-0">
        {/* Card/Area/Title */}
        <CardTitle className="text-lg leading-tight">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3 flex-1">
        {/* Auto-layout: Vertical stack with fixed gaps */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Card/Area/Rent */}
          <div className="flex items-center gap-2 min-h-5">
            <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm">{rent}</span>
          </div>
          
          {/* Card/Area/Commute */}
          <div className="flex items-center gap-2 min-h-5">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm">{commute}</span>
          </div>
          
          {/* Card/Area/Safety */}
          <div className="flex items-center gap-2 min-h-5">
            <Shield className={`w-4 h-4 flex-shrink-0 ${getSafetyColor(safetyPercentile)}`} />
            <span className={`text-sm ${getSafetyColor(safetyPercentile)}`}>{safety}</span>
          </div>
          
          {/* Card/Area/Lifestyle */}
          <div className="flex items-center gap-2 min-h-5">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm">{lifestyle}</span>
          </div>
        </div>

        {/* Card/Area/Why */}
        <div className="pt-2 border-t border-gray-100 flex-1">
          <p className="text-sm italic text-gray-600 leading-relaxed">
            {reasoning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}