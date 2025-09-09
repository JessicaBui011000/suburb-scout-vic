import { Info } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header/Title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-medium text-gray-900">Best-Fit Areas Demo</h1>
        </div>
        
        {/* Header/Actions */}
        <div className="flex-shrink-0">
          <Button variant="ghost" size="sm" className="p-2 rounded-full">
            {/* Header/Actions/InfoIcon */}
            <Info className="w-4 h-4 text-gray-500" />
            <span className="sr-only">Information</span>
          </Button>
        </div>
      </div>
    </header>
  );
}