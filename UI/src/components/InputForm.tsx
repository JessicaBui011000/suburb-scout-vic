import { useState } from 'react';
import { Car, Bus, PersonStanding, Coffee, Dumbbell, ShoppingCart, Trees } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

type TransportMode = 'car' | 'public-transport' | 'walking';

export function InputForm() {
  const [transportModes, setTransportModes] = useState<TransportMode[]>(['car']);
  const [mustHaves, setMustHaves] = useState<string[]>([]);

  const transportModeOptions = [
    { id: 'car', icon: Car, label: 'Car' },
    { id: 'public-transport', icon: Bus, label: 'Public Transport' },
    { id: 'walking', icon: PersonStanding, label: 'Walking' },
  ] as const;

  const mustHaveOptions = [
    { id: 'cafe', icon: Coffee, label: 'Café' },
    { id: 'gym', icon: Dumbbell, label: 'Gym' },
    { id: 'grocery', icon: ShoppingCart, label: 'Grocery' },
    { id: 'park', icon: Trees, label: 'Park' },
  ];

  const toggleMustHave = (id: string) => {
    setMustHaves(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleTransportMode = (id: TransportMode) => {
    setTransportModes(prev => 
      prev.includes(id) 
        ? prev.filter(mode => mode !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="w-full bg-gray-50">
      <div className="px-4 py-6 mx-auto max-w-4xl sm:px-6 sm:py-8 lg:px-8">
        {/* InputForm - Auto-layout: Horizontal fill */}
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {/* InputForm/Fields - Auto-layout: Vertical with 24px gaps */}
            <div className="flex flex-col gap-6">
              {/* InputForm/Fields/CompanyAddress */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="address" className="flex-shrink-0">Company Address</Label>
                <Input
                  id="address"
                  placeholder="Enter company address..."
                  className="w-full h-12 bg-input-background rounded-xl border-0 px-4"
                />
              </div>

              {/* InputForm/Fields/BudgetCommute */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* InputForm/Fields/BudgetCommute/Budget */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budget" className="flex-shrink-0">Budget (per week)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">$</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="480"
                      className="h-12 bg-input-background rounded-xl border-0 pl-8 pr-4"
                    />
                  </div>
                </div>
                
                {/* InputForm/Fields/BudgetCommute/Commute */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="commute" className="flex-shrink-0">Max commute time</Label>
                  <div className="relative">
                    <Input
                      id="commute"
                      type="number"
                      placeholder="30"
                      className="h-12 bg-input-background rounded-xl border-0 px-4 pr-20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">minutes</span>
                  </div>
                </div>
              </div>

              {/* InputForm/Fields/TransportMode */}
              <div className="flex flex-col gap-2">
                <Label className="flex-shrink-0">Transport Mode (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {transportModeOptions.map(({ id, icon: Icon, label }) => (
                    <Button
                      key={id}
                      variant={transportModes.includes(id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTransportMode(id)}
                      className="flex items-center gap-2 h-12 px-3 sm:px-4 rounded-xl flex-shrink-0"
                    >
                      {/* TransportMode/Icon */}
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline text-sm">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* InputForm/Fields/HomeType */}
              <div className="flex flex-col gap-2">
                <Label className="flex-shrink-0">Home Type</Label>
                <Select defaultValue="apartment">
                  <SelectTrigger className="h-12 bg-input-background rounded-xl border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* InputForm/Fields/MustHaves */}
              <div className="flex flex-col gap-2">
                <Label className="flex-shrink-0">Must-Haves</Label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
                  {mustHaveOptions.map(({ id, icon: Icon, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={mustHaves.includes(id)}
                        onCheckedChange={() => toggleMustHave(id)}
                        className="flex-shrink-0"
                      />
                      <Label 
                        htmlFor={id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        {/* MustHaves/Icon */}
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-shrink-0">{label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* InputForm/Fields/SubmitButton */}
              <div className="pt-2">
                <Button 
                  className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  Suggest Areas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}