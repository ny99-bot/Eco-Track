import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, MapPin, Sparkles, Leaf, Droplet, Wind, Sun, TreePine, Factory, Globe } from "lucide-react";

const ecoTips = [
  {
    category: "Energy",
    icon: Sun,
    color: "yellow",
    tips: [
      {
        title: "Switch to LED Bulbs",
        description: "LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer.",
        impact: "Save ~$75/year",
      },
      {
        title: "Unplug 'Vampire' Devices",
        description: "Electronics in standby mode consume 5-10% of home electricity. Unplug or use smart power strips.",
        impact: "Reduce 100 lbs CO₂/year",
      },
      {
        title: "Optimize Thermostat",
        description: "Set thermostat 7-10°F back for 8 hours daily. Use a programmable thermostat for automatic savings.",
        impact: "Save 10% on energy bills",
      },
    ],
  },
  {
    category: "Transportation",
    icon: Wind,
    color: "blue",
    tips: [
      {
        title: "Bike for Short Trips",
        description: "Replace car trips under 2 miles with biking. It's healthier and eliminates emissions entirely.",
        impact: "Save 1 lb CO₂ per mile",
      },
      {
        title: "Carpool or Use Transit",
        description: "Sharing rides or using public transport reduces your carbon footprint by up to 50%.",
        impact: "Save 4,800 lbs CO₂/year",
      },
      {
        title: "Maintain Your Vehicle",
        description: "Keep tires properly inflated and engine tuned. Regular maintenance improves fuel efficiency by 10%.",
        impact: "Save $100/year on gas",
      },
    ],
  },
  {
    category: "Diet",
    icon: Leaf,
    color: "green",
    tips: [
      {
        title: "Meatless Mondays",
        description: "Skipping meat one day per week reduces your carbon footprint by 8 lbs. Beef has the highest impact.",
        impact: "Save 416 lbs CO₂/year",
      },
      {
        title: "Buy Local & Seasonal",
        description: "Local produce travels fewer miles and seasonal items don't require energy-intensive greenhouses.",
        impact: "Reduce food miles by 80%",
      },
      {
        title: "Reduce Food Waste",
        description: "Plan meals, store food properly, and compost scraps. 30-40% of food supply is wasted.",
        impact: "Save $1,500/year",
      },
    ],
  },
  {
    category: "Water",
    icon: Droplet,
    color: "teal",
    tips: [
      {
        title: "Fix Leaky Faucets",
        description: "A leaking faucet can waste 3,000 gallons of water per year. Simple repairs make a big difference.",
        impact: "Save 3,000 gallons/year",
      },
      {
        title: "Shorter Showers",
        description: "Reduce shower time by 2 minutes. Install low-flow showerheads to save even more.",
        impact: "Save 1,750 gallons/year",
      },
      {
        title: "Run Full Loads",
        description: "Only run dishwashers and washing machines with full loads. Use cold water when possible.",
        impact: "Save 3,400 gallons/year",
      },
    ],
  },
];

const regionalData = [
  {
    region: "Great Lakes (Michigan)",
    facts: [
      "The Great Lakes contain 21% of the world's surface fresh water",
      "Over 3,500 species of plants and animals call the Great Lakes home",
      "35 million people depend on the Great Lakes for drinking water",
      "Climate change is warming Great Lakes waters 2x faster than air temperature",
    ],
    concerns: [
      "Invasive species threatening native ecosystems",
      "Microplastics pollution affecting aquatic life",
      "Agricultural runoff causing algal blooms",
      "Rising water temperatures impacting fish populations",
    ],
    actions: [
      "Participate in beach cleanups",
      "Support wetland restoration projects",
      "Reduce plastic use and properly dispose waste",
      "Advocate for stronger water quality regulations",
    ],
  },
  {
    region: "United States",
    facts: [
      "The U.S. emits 15% of global CO₂ despite being 4% of population",
      "Americans generate 4.5 lbs of waste per person daily",
      "Renewable energy reached 21% of U.S. electricity in 2023",
      "Transportation accounts for 29% of U.S. greenhouse gas emissions",
    ],
    concerns: [
      "Increasing frequency of extreme weather events",
      "Biodiversity loss and habitat destruction",
      "Air quality issues in urban areas",
      "Ocean acidification affecting coastal ecosystems",
    ],
    actions: [
      "Support clean energy transition",
      "Reduce single-use plastics",
      "Vote for climate-conscious policies",
      "Participate in community conservation efforts",
    ],
  },
];

const ecoFacts = [
  {
    icon: Factory,
    title: "Industrial Revolution Impact",
    fact: "Since 1850, atmospheric CO₂ has increased by 50%, primarily from burning fossil fuels.",
  },
  {
    icon: Globe,
    title: "Ocean Absorption",
    fact: "Oceans absorb 25% of human CO₂ emissions, causing acidification that threatens marine life.",
  },
  {
    icon: TreePine,
    title: "Forest Power",
    fact: "A mature tree absorbs ~48 lbs of CO₂ per year. Deforestation releases 15% of global emissions.",
  },
  {
    icon: Wind,
    title: "Renewable Growth",
    fact: "Solar and wind energy costs have dropped 90% since 2010, making clean energy increasingly accessible.",
  },
  {
    icon: Droplet,
    title: "Water Footprint",
    fact: "It takes 1,800 gallons of water to produce 1 pound of beef. Plant-based diets significantly reduce water use.",
  },
  {
    icon: Sun,
    title: "Solar Potential",
    fact: "The sun delivers more energy to Earth in one hour than humanity uses in an entire year.",
  },
];

export default function Learn() {
  const [selectedRegion, setSelectedRegion] = useState(0);

  const categoryColors = {
    yellow: "from-yellow-500 to-orange-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    teal: "from-teal-500 to-cyan-500",
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Sustainability Hub
          </h1>
          <p className="text-gray-600 mt-1">Learn, discover, and take action for our planet</p>
        </div>

        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="tips" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Eco Tips</span>
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Regional Data</span>
            </TabsTrigger>
            <TabsTrigger value="facts" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Eco Facts</span>
            </TabsTrigger>
          </TabsList>

          {/* Eco Tips Tab */}
          <TabsContent value="tips" className="space-y-6 mt-6">
            {ecoTips.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[category.color]} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {category.tips.map((tip, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{tip.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{tip.description}</p>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {tip.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Regional Data Tab */}
          <TabsContent value="regional" className="space-y-6 mt-6">
            <div className="flex gap-2 mb-4">
              {regionalData.map((data, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRegion(index)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedRegion === index
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {data.region}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Key Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {regionalData[selectedRegion].facts.map((fact, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Wind className="w-5 h-5" />
                    Environmental Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {regionalData[selectedRegion].concerns.map((concern, index) => (
                      <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Take Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {regionalData[selectedRegion].actions.map((action, index) => (
                      <li key={index} className="text-sm text-emerald-800 flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Eco Facts Tab */}
          <TabsContent value="facts" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecoFacts.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.fact}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}