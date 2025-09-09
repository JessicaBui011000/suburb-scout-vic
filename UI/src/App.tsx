import { useState } from 'react';
// Component imports - matching Figma requirements exactly:
// Header, InputForm, MapView, AreaCard, CompareDrawer
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { MapView } from './components/MapView';
import { AreaCard } from './components/AreaCard';
import { CompareDrawer } from './components/CompareDrawer';
import { ScrollArea } from './components/ui/scroll-area';

export default function App() {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const sampleAreas = [
    {
      name: "Richmond",
      rent: "$480/week",
      commute: "22 min",
      safety: "70th percentile",
      safetyPercentile: 70,
      lifestyle: "15 cafés, 4 gyms",
      reasoning: "Great balance of affordability and lifestyle amenities with excellent transport links to the CBD."
    },
    {
      name: "Brunswick",
      rent: "$520/week",
      commute: "18 min",
      safety: "65th percentile",
      safetyPercentile: 65,
      lifestyle: "22 cafés, 6 gyms",
      reasoning: "Vibrant cultural scene with excellent dining options, slightly higher rent but shorter commute time."
    },
    {
      name: "Footscray",
      rent: "$420/week",
      commute: "25 min",
      safety: "55th percentile",
      safetyPercentile: 55,
      lifestyle: "12 cafés, 3 gyms",
      reasoning: "Most affordable option with growing food scene and good transport accessibility."
    },
    {
      name: "Preston",
      rent: "$460/week",
      commute: "28 min",
      safety: "62nd percentile",
      safetyPercentile: 62,
      lifestyle: "18 cafés, 5 gyms",
      reasoning: "Emerging area with great value for money and strong community feel."
    }
  ];

  const compareData = sampleAreas.map((area, index) => ({
    area: area.name,
    rent: area.rent,
    commute: area.commute,
    safety: area.safety,
    safetyPercentile: area.safetyPercentile,
    lifestyle: area.lifestyle,
    score: 85 - index * 5
  }));

  return (
    <>
      {/* Page/Desktop (1440×…) - Hidden on mobile */}
      <div className="hidden lg:flex min-h-screen bg-white flex-col w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <Header />
        
        {/* InputForm - Auto-layout: Horizontal fill */}
        <InputForm />
        
        {/* MainContent - Auto-layout: Fill container */}
        <main className="flex-1 min-h-0">
          <div className="p-6 h-full">
            <div className="max-w-7xl mx-auto h-full">
              {/* Auto-layout: Horizontal with 70/30 split */}
              <div className="grid grid-cols-10 gap-6 h-full min-h-[600px]">
                {/* MapView - 70% width */}
                <div className="col-span-7 h-full">
                  <MapView onCompareClick={() => setIsCompareOpen(true)} />
                </div>
                
                {/* Card List - 30% width, Auto-layout: Vertical */}
                <div className="col-span-3 flex flex-col h-full">
                  <div className="flex-shrink-0 mb-4">
                    <h2 className="text-lg font-medium">Suggested Areas</h2>
                  </div>
                  
                  {/* Auto-layout: Vertical scroll */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full pr-2">
                      {/* Auto-layout: Vertical stack with 16px gaps */}
                      <div className="flex flex-col gap-4">
                        {sampleAreas.map((area, index) => (
                          <AreaCard key={`desktop-area-${index}`} {...area} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* CompareDrawer - Auto-layout: Fixed positioning */}
        <CompareDrawer
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          data={compareData}
        />
      </div>

      {/* Page/Mobile (390×…) - Hidden on desktop */}
      <div className="flex lg:hidden min-h-screen bg-white flex-col w-full max-w-[390px] mx-auto">
        {/* Header */}
        <Header />
        
        {/* InputForm - Auto-layout: Horizontal fill */}
        <InputForm />
        
        {/* MainContent - Auto-layout: Fill container */}
        <main className="flex-1 min-h-0">
          <div className="p-4 h-full">
            {/* Auto-layout: Vertical stack */}
            <div className="flex flex-col gap-4 h-full">
              {/* MapView - Fixed height */}
              <div className="h-96 flex-shrink-0">
                <MapView onCompareClick={() => setIsCompareOpen(true)} />
              </div>
              
              {/* Card List - Auto-layout: Horizontal scroll */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex-shrink-0">
                  <h2 className="text-lg font-medium">Suggested Areas</h2>
                </div>
                
                <div className="flex-1">
                  <ScrollArea className="w-full">
                    {/* Auto-layout: Horizontal with 16px gaps */}
                    <div className="flex gap-4 pb-4">
                      {sampleAreas.map((area, index) => (
                        <div key={`mobile-area-${index}`} className="w-80 flex-shrink-0">
                          <AreaCard {...area} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* CompareDrawer - Auto-layout: Fixed positioning */}
        <CompareDrawer
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          data={compareData}
        />
      </div>
    </>
  );
}