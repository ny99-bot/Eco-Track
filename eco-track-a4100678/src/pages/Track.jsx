
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Bike, Bus, Zap, Lightbulb, UtensilsCrossed, ShoppingBag, TrendingDown, AlertCircle, CheckCircle, TrendingUp, TreePine, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const activityData = {
  transport: {
    icon: Car,
    color: "blue",
    options: [
      { name: "Car (Gasoline)", co2PerUnit: 0.41, unit: "mile", description: "Standard gas-powered vehicle" },
      { name: "Car (Electric)", co2PerUnit: 0.15, unit: "mile", description: "Electric vehicle charging" },
      { name: "Bus", co2PerUnit: 0.1, unit: "mile", description: "Public bus transportation" },
      { name: "Train/Subway", co2PerUnit: 0.05, unit: "mile", description: "Rail transportation" },
      { name: "Bike", co2PerUnit: -0.41, unit: "mile", description: "Replaced driving with biking" },
      { name: "Walk", co2PerUnit: -0.41, unit: "mile", description: "Replaced driving with walking" },
      { name: "Carpool", co2PerUnit: 0.2, unit: "mile", description: "Shared ride, ~50% reduction" },
      { name: "Motorcycle", co2PerUnit: 0.25, unit: "mile", description: "Gas-powered motorcycle" },
    ]
  },
  energy: {
    icon: Zap,
    color: "yellow",
    options: [
      { name: "Electricity Used", co2PerUnit: 0.37, unit: "kWh", description: "Grid electricity consumption" },
      { name: "Natural Gas Used", co2PerUnit: 5.3, unit: "therm", description: "Natural gas heating/cooking" },
      { name: "Hot Shower", co2PerUnit: 0.2, unit: "minute", description: "Standard gas/electric water heater" },
      { name: "Hot Shower (Low-flow)", co2PerUnit: 0.1, unit: "minute", description: "Low-flow showerhead, 50% reduction" },
      { name: "Cold/Cool Shower", co2PerUnit: 0.02, unit: "minute", description: "Minimal heating energy" },
      { name: "Solar Energy Generated", co2PerUnit: -0.37, unit: "kWh", description: "Offset grid electricity" },
      { name: "LED Bulbs Installed", co2PerUnit: -1.2, unit: "bulb", description: "Replaced incandescent bulbs" },
      { name: "Thermostat Optimized", co2PerUnit: -2.0, unit: "day", description: "Reduced heating/cooling" },
      { name: "Appliances Unplugged", co2PerUnit: -0.5, unit: "device", description: "Eliminated phantom energy" },
      { name: "Energy Audit Done", co2PerUnit: -3.0, unit: "audit", description: "Home efficiency improvements" },
    ]
  },
  diet: {
    icon: UtensilsCrossed,
    color: "green",
    options: [
      { name: "Beef (per kg)", co2PerUnit: 36, unit: "kg", description: "Highest carbon footprint meat" },
      { name: "Pork (per kg)", co2PerUnit: 12, unit: "kg", description: "Medium-high carbon meat" },
      { name: "Chicken (per kg)", co2PerUnit: 6, unit: "kg", description: "Lower carbon poultry" },
      { name: "Fish (per kg)", co2PerUnit: 5, unit: "kg", description: "Varies by type and source" },
      { name: "Vegetarian Meal", co2PerUnit: 3, unit: "meal", description: "~250g food, dairy included" },
      { name: "Vegan Meal", co2PerUnit: 1.5, unit: "meal", description: "~250g plant-based food" },
      { name: "Meatless Day", co2PerUnit: -15, unit: "day", description: "Replaced typical meat consumption" },
      { name: "Local/Seasonal Produce", co2PerUnit: -1.0, unit: "kg", description: "Reduced food miles" },
    ]
  },
  shopping: {
    icon: ShoppingBag,
    color: "purple",
    options: [
      { name: "Fast Fashion Item", co2PerUnit: 7.5, unit: "item", description: "New clothing/accessories" },
      { name: "General Clothing Purchase", co2PerUnit: 1.9, unit: "USD", description: "Based on spending amount" },
      { name: "Secondhand Clothing", co2PerUnit: -3.5, unit: "item", description: "Avoided new production" },
      { name: "Reusable Bag Used", co2PerUnit: -0.04, unit: "bag", description: "Replaced single-use plastic" },
      { name: "Reusable Water Bottle", co2PerUnit: -0.5, unit: "day", description: "Avoided plastic bottles" },
      { name: "Local Farmers Market", co2PerUnit: -2.0, unit: "visit", description: "Reduced transportation emissions" },
      { name: "Bulk Shopping (no packaging)", co2PerUnit: -1.0, unit: "trip", description: "Avoided packaging waste" },
      { name: "Electronics Recycled", co2PerUnit: -5.0, unit: "device", description: "Proper disposal/reuse" },
    ]
  }
};

const offsetActions = [
  { name: "Plant a tree", impact: -0.05, category: "shopping", subcategory: "Tree Planting", description: "Planted a tree for carbon offset", icon: "🌱" },
  { name: "Maintain trees/composting", impact: -0.5, category: "shopping", subcategory: "Composting & Tree Care", description: "Maintained trees or composted organic waste", icon: "🌳" },
  { name: "Bike/walk 5 miles", impact: -1, category: "transport", subcategory: "Bike/Walk", description: "Biked or walked 5 miles instead of driving", icon: "🚴" },
  { name: "Work from home", impact: -2, category: "transport", subcategory: "Work from Home", description: "Worked from home, avoiding commute", icon: "🏠" },
  { name: "Renewable energy/thermostat", impact: -1.5, category: "energy", subcategory: "Energy Savings", description: "Used renewable energy or optimized thermostat", icon: "⚡" },
  { name: "LED lights & unplug devices", impact: -0.3, category: "energy", subcategory: "LED & Unplugging", description: "Used LED lights and unplugged devices", icon: "💡" },
  { name: "Vegetarian day", impact: -2.5, category: "diet", subcategory: "Vegetarian Day", description: "Ate vegetarian for the entire day", icon: "🥗" },
  { name: "Vegan day", impact: -3.5, category: "diet", subcategory: "Vegan Day", description: "Ate vegan for the entire day", icon: "🌿" },
  { name: "Reusable bottles", impact: -0.1, category: "shopping", subcategory: "Reusable Bottle", description: "Used reusable water bottles", icon: "♻️" },
  { name: "Avoid fast fashion", impact: -0.3, category: "shopping", subcategory: "Avoided Fast Fashion", description: "Avoided purchasing fast fashion items", icon: "👕" },
  { name: "Buy local produce", impact: -0.5, category: "shopping", subcategory: "Local Produce", description: "Bought local or seasonal produce", icon: "🛒" }
];

export default function Track() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("transport");
  const [subcategory, setSubcategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [previewCO2, setPreviewCO2] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOffsetGuide, setShowOffsetGuide] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userProgress = [] } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.filter({ created_by: user?.email }, '-created_date', 100),
    enabled: !!user,
    initialData: [],
  });

  const createActivityMutation = useMutation({
    mutationFn: (activityData) => base44.entities.Activity.create(activityData),
    onSuccess: async (newActivity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // Update user progress
      const progress = userProgress[0];
      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        // Ensure activities state is up-to-date with newActivity for correct calculation
        const allTodayActivities = [...activities, newActivity].filter(a => a.date === today);

        const todayEmissions = allTodayActivities.reduce((sum, a) => {
          const impact = a.co2_impact || 0;
          return sum + (impact > 0 ? impact : 0);
        }, 0);
        
        const lastActivityDate = progress.last_activity_date;
        let newStreak = progress.current_streak || 0;
        
        // Update streak logic
        // If the last recorded activity was today, we just re-evaluate based on the new total.
        // If it was yesterday, and yesterday was good, increment streak.
        // Otherwise, reset streak.
        if (lastActivityDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActivityDate === today) {
            // Activity added on the same day. If still under limit, keep streak. If now over, reset.
            if (todayEmissions <= progress.daily_carbon_limit) {
              // Streak maintained (or started if this is the first today activity)
            } else {
              newStreak = 0; // Over limit, reset streak for today
            }
          } else if (lastActivityDate === yesterdayStr) {
            // Check yesterday's total before deciding today's streak start
            const yesterdayActivities = activities.filter(a => a.date === yesterdayStr); // Use previous activities data for yesterday
            const yesterdayTotal = yesterdayActivities.reduce((sum, a) => {
              const impact = a.co2_impact || 0;
              return sum + (impact > 0 ? impact : 0);
            }, 0);
            
            if (yesterdayTotal <= progress.daily_carbon_limit) {
              // Yesterday was good, now check if today is good so far
              if (todayEmissions <= progress.daily_carbon_limit) {
                newStreak += 1; // Extend streak
              } else {
                newStreak = 0; // Today started over limit
              }
            } else {
              newStreak = 0; // Yesterday was over limit, streak broken
            }
          } else {
            // Last activity was more than one day ago, reset streak for new start
            if (todayEmissions <= progress.daily_carbon_limit) {
              newStreak = 1; // Start new streak if today is good
            } else {
              newStreak = 0;
            }
          }
        } else {
          // No last activity date, start streak if first activity and under limit
          if (todayEmissions <= progress.daily_carbon_limit) {
            newStreak = 1;
          } else {
            newStreak = 0;
          }
        }
        
        // Calculate new total footprint (only add positive emissions)
        const newTotalFootprint = (progress.total_carbon_footprint || 0) + (newActivity.co2_impact > 0 ? newActivity.co2_impact : 0);
        
        // Award points for eco-friendly activities (negative impact)
        const pointsEarned = newActivity.co2_impact < 0 ? Math.floor(Math.abs(newActivity.co2_impact) * 10) : 5;
        
        await base44.entities.UserProgress.update(progress.id, {
          total_carbon_footprint: newTotalFootprint,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, progress.longest_streak || 0),
          last_activity_date: today,
          eco_points: (progress.eco_points || 0) + pointsEarned
        });
        queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSubcategory("");
      setQuantity("");
      setDescription("");
      setPreviewCO2(null);
    },
  });

  // Calculate CO2 impact preview
  useEffect(() => {
    if (subcategory && quantity && parseFloat(quantity) > 0) {
      const selectedOption = activityData[category].options.find(opt => opt.name === subcategory);
      if (selectedOption) {
        const impact = selectedOption.co2PerUnit * parseFloat(quantity);
        setPreviewCO2(impact);
      }
    } else {
      setPreviewCO2(null);
    }
  }, [category, subcategory, quantity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subcategory || !quantity) return;

    const selectedOption = activityData[category].options.find(opt => opt.name === subcategory);
    if (!selectedOption) return; // Should not happen if subcategory is selected

    const co2Impact = selectedOption.co2PerUnit * parseFloat(quantity);

    createActivityMutation.mutate({
      category,
      subcategory,
      description: description || `${subcategory} - ${quantity} ${selectedOption.unit}`,
      co2_impact: co2Impact,
      date: new Date().toISOString().split('T')[0],
      quantity: parseFloat(quantity),
      unit: selectedOption.unit,
      created_by: user?.email, // Ensure created_by is set
    });
  };

  const handleQuickOffset = (action) => {
    createActivityMutation.mutate({
      category: action.category,
      subcategory: action.subcategory,
      description: action.description,
      co2_impact: action.impact,
      date: new Date().toISOString().split('T')[0],
      quantity: 1, // Quick offsets are usually a single action
      unit: "action",
      created_by: user?.email,
    });
  };

  // Calculate today's progress
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(a => a.date === today);
  const todayEmissions = todayActivities.reduce((sum, a) => {
    return sum + (a.co2_impact || 0); // Include both positive and negative (NET emissions)
  }, 0);
  const progress = userProgress[0] || { daily_carbon_limit: 30, total_carbon_footprint: 0, current_streak: 0, longest_streak: 0, eco_points: 0 };
  const remainingLimit = progress.daily_carbon_limit - todayEmissions;

  const selectedOption = subcategory ? activityData[category].options.find(opt => opt.name === subcategory) : null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Track Your Carbon Footprint
            </h1>
            <p className="text-gray-600 mt-1">Average daily emissions: 20-40 kg CO₂ • Stay under your limit!</p>
          </div>
          <Button
            onClick={() => setShowOffsetGuide(!showOffsetGuide)}
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <TreePine className="w-4 h-4 mr-2" />
            Quick Offsets
          </Button>
        </div>

        {showSuccess && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900">
              Activity logged successfully! Your carbon footprint has been updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Offset Guide */}
        {showOffsetGuide && (
          <Card className="border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-900">Quick Carbon Offsets</CardTitle>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-1">One-click actions to reduce your footprint today</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {offsetActions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleQuickOffset(action)}
                    disabled={createActivityMutation.isPending}
                    variant="outline"
                    className="h-auto p-3 sm:p-4 justify-between hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{action.icon}</span>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{action.name}</p>
                        <p className="text-xs text-gray-600 hidden sm:block">{action.description}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-semibold ml-2 flex-shrink-0 text-xs">
                      {action.impact} kg
                    </Badge>
                  </Button>
                ))}
              </div>
              <div className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-3 sm:p-4 text-white">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm">
                    <strong>Pro Tip:</strong> Combine multiple actions to maximize impact! Work from home + vegan day + renewable energy = up to 7 kg CO₂ saved daily.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Limit Card */}
        <Card className={`border-2 ${remainingLimit >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Carbon Budget</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-bold ${remainingLimit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                    {remainingLimit >= 0 ? remainingLimit.toFixed(1) : 0}
                  </span>
                  <span className="text-sm text-gray-600">kg remaining</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {todayEmissions.toFixed(1)} / {progress.daily_carbon_limit} kg used today
                </p>
              </div>
              {remainingLimit >= 0 ? (
                <TrendingDown className="w-12 h-12 text-emerald-500" />
              ) : (
                <TrendingUp className="w-12 h-12 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* CO2 Preview Card */}
        {previewCO2 !== null && (
          <Card className={`border-2 ${previewCO2 <= 0 ? 'border-emerald-300 bg-emerald-50' : 'border-orange-300 bg-orange-50'}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {previewCO2 <= 0 ? <TrendingDown className="w-8 h-8 text-emerald-600" /> : <TrendingUp className="w-8 h-8 text-orange-600" />}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {previewCO2 <= 0 ? '✨ Carbon Offset' : '⚠️ Carbon Addition'}
                    </p>
                    <p className={`text-3xl font-bold ${previewCO2 <= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                      {previewCO2 <= 0 ? '' : '+'}{previewCO2.toFixed(2)} kg CO₂
                    </p>
                    {selectedOption && (
                      <p className="text-xs text-gray-600 mt-1">{selectedOption.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  {previewCO2 > 0 ? (
                    <>
                      <p className="text-sm font-medium text-orange-700">New daily total</p>
                      <p className="text-2xl font-bold text-orange-900">{(todayEmissions + previewCO2).toFixed(1)} kg</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {(todayEmissions + previewCO2) <= progress.daily_carbon_limit ? '✓ Still under limit' : '⚠ Over limit'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-emerald-700">EcoPoints earned</p>
                      <p className="text-2xl font-bold text-emerald-900">+{Math.floor(Math.abs(previewCO2) * 10)}</p>
                      <p className="text-xs text-gray-600 mt-1">Great eco-friendly choice!</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">Log Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={category} onValueChange={setCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                  {Object.entries(activityData).map(([key, data]) => {
                    const Icon = data.icon;
                    return (
                      <TabsTrigger 
                        key={key} 
                        value={key}
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline capitalize">{key}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {Object.entries(activityData).map(([key, data]) => (
                  <TabsContent key={key} value={key} className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="subcategory" className="text-sm font-semibold text-gray-700">
                        Activity Type
                      </Label>
                      <Select value={subcategory} onValueChange={setSubcategory}>
                        <SelectTrigger id="subcategory">
                          <SelectValue placeholder={`Select ${key} activity`} />
                        </SelectTrigger>
                        <SelectContent>
                          {data.options.map((option) => (
                            <SelectItem key={option.name} value={option.name}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{option.name}</span>
                                <span className={`text-xs font-semibold ${option.co2PerUnit <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                  {option.co2PerUnit > 0 ? '+' : ''}{option.co2PerUnit} kg/{option.unit}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {subcategory && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                            Quantity ({activityData[category].options.find(opt => opt.name === subcategory)?.unit})
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            step="0.1"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter quantity"
                            className="text-lg"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                            Notes (Optional)
                          </Label>
                          <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add any additional notes..."
                          />
                        </div>
                      </>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 text-lg shadow-lg shadow-emerald-500/30"
                disabled={!subcategory || !quantity || createActivityMutation.isPending}
              >
                {createActivityMutation.isPending ? 'Logging...' : 'Log Activity'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">Formula Breakdown</h3>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Total Daily CO₂ = Transport + Energy + Diet + Shopping</strong><br/>
                  Emissions are calculated using research-based factors: gasoline cars (0.41 kg/mile), electricity (0.37 kg/kWh), beef (36 kg/kg), fast fashion (7.5 kg/item), etc. 
                  Eco-friendly choices offset emissions and earn bonus EcoPoints!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
