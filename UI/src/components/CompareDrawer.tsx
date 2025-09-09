import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface CompareData {
  area: string;
  rent: string;
  commute: string;
  safety: string;
  safetyPercentile: number;
  lifestyle: string;
  score: number;
}

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompareData[];
}

export function CompareDrawer({ isOpen, onClose, data }: CompareDrawerProps) {
  if (!isOpen) return null;

  const getSafetyColor = (percentile: number) => {
    if (percentile < 33) return 'text-red-600';
    if (percentile < 66) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <>
      {/* CompareDrawer/Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* CompareDrawer - Auto-layout: Vertical fill */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] flex flex-col">
        {/* CompareDrawer/Header - Auto-layout: Horizontal space-between */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          {/* CompareDrawer/Header/Title */}
          <h3 className="text-lg font-medium">Compare Areas</h3>
          {/* CompareDrawer/Header/CloseButton */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 rounded-full"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* CompareDrawer/Content - Auto-layout: Fill remaining space */}
        <div className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-6">
            {/* CompareDrawer/Content/Table */}
            <div className="overflow-x-auto">
              <Table>
                {/* CompareDrawer/Content/Table/Header */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium text-left min-w-20">Area</TableHead>
                    <TableHead className="font-medium text-left min-w-16">Rent</TableHead>
                    <TableHead className="font-medium text-left min-w-16">Commute</TableHead>
                    <TableHead className="font-medium text-left min-w-16">Safety</TableHead>
                    <TableHead className="font-medium text-left min-w-24">Lifestyle</TableHead>
                    <TableHead className="font-medium text-left min-w-16">Score</TableHead>
                  </TableRow>
                </TableHeader>
                {/* CompareDrawer/Content/Table/Body */}
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      {/* CompareDrawer/Content/Table/Row/Area */}
                      <TableCell className="font-medium text-sm">{row.area}</TableCell>
                      {/* CompareDrawer/Content/Table/Row/Rent */}
                      <TableCell className="text-sm">{row.rent}</TableCell>
                      {/* CompareDrawer/Content/Table/Row/Commute */}
                      <TableCell className="text-sm">{row.commute}</TableCell>
                      {/* CompareDrawer/Content/Table/Row/Safety */}
                      <TableCell className={`text-sm ${getSafetyColor(row.safetyPercentile)}`}>
                        {row.safety}
                      </TableCell>
                      {/* CompareDrawer/Content/Table/Row/Lifestyle */}
                      <TableCell className="text-sm">{row.lifestyle}</TableCell>
                      {/* CompareDrawer/Content/Table/Row/Score */}
                      <TableCell className="text-sm font-medium">{row.score}/100</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}