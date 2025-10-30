
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingDown,
  Target,
  Award,
  Flame,
  TreePine,
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Trophy,
  MapPin,
  Bot,
  TrendingUp,
  X // Added X icon for closing the guide
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.filter({ created_by: user?.email }, '-created_date', 100),
    enabled: !!user,
    initialData: [],
  });

  const { data: userProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const progress = userProgress[0] || {
    eco_points: 0,
    total_carbon_footprint: 0,
    current_streak: 0,
    daily_carbon_limit: 30,
    weekly_carbon_limit: 200,
  };

  // Calculate today's carbon footprint (NET emissions including offsets)
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(a => a.date === today);
  const todayCO2 = todayActivities.reduce((sum, a) => {
    return sum + (a.co2_impact || 0); // Include both positive and negative
  }, 0);
  const todayReductions = todayActivities.reduce((sum, a) => {
    const impact = a.co2_impact || 0;
    return sum + (impact < 0 ? Math.abs(impact) : 0);
  }, 0);
  
  const dailyProgress = (todayCO2 / progress.daily_carbon_limit) * 100;
  const isUnderLimit = todayCO2 < progress.daily_carbon_limit;

  // Calculate this week's stats (NET emissions)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekActivities = activities.filter(a => new Date(a.date) >= weekAgo);
  const weekCO2 = weekActivities.reduce((sum, a) => {
    return sum + (a.co2_impact || 0); // Include both positive and negative
  }, 0);
  const weekReductions = weekActivities.reduce((sum, a) => {
    const impact = a.co2_impact || 0;
    return sum + (impact < 0 ? Math.abs(impact) : 0);
  }, 0);
  const weekProgress = (weekCO2 / progress.weekly_carbon_limit) * 100;

  // Category breakdown for this week (only positive emissions for breakdown)
  const categoryTotals = weekActivities.reduce((acc, activity) => {
    if (activity.co2_impact > 0) {
      acc[activity.category] = (acc[activity.category] || 0) + activity.co2_impact;
    }
    return acc;
  }, {});

  const categoryIcons = {
    transport: Car,
    energy: Zap,
    diet: UtensilsCrossed,
    shopping: ShoppingBag,
  };

  const treesNeeded = (todayCO2 / 21).toFixed(1);
  const carbonSavings = progress.daily_carbon_limit - todayCO2;

  // Data for the Offset Guide (no longer used, but kept for context if needed later)
  const offsetActions = [
    { category: "Trees & Composting", actions: [
      { name: "Plant a tree", impact: 0.05, unit: "kg/day", icon: "🌱" },
      { name: "Maintain trees/composting", impact: 0.5, unit: "kg/day", icon: "🌳" }
    ]},
    { category: "Transportation", actions: [
      { name: "Bike/walk 5 miles", impact: 1, unit: "kg/day", icon: "🚴" },
      { name: "Work from home", impact: 2, unit: "kg/day", icon: "🏠" }
    ]},
    { category: "Home Energy", actions: [
      { name: "Renewable energy/thermostat", impact: 1.5, unit: "kg/day", icon: "⚡" },
      { name: "LED lights & unplug devices", impact: 0.3, unit: "kg/day", icon: "💡" }
    ]},
    { category: "Diet", actions: [
      { name: "Vegetarian day", impact: 2.5, unit: "kg/day", icon: "🥗" },
      { name: "Vegan day", impact: 3.5, unit: "kg/day", icon: "🌿" }
    ]},
    { category: "Mindful Habits", actions: [
      { name: "Reusable bottles", impact: 0.1, unit: "kg/day", icon: "♻️" },
      { name: "Avoid fast fashion", impact: 0.3, unit: "kg/day", icon: "👕" },
      { name: "Buy local produce", impact: 0.5, unit: "kg/day", icon: "🛒" }
    ]}
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Welcome back{user ? `, ${user.full_name?.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">Stay within your carbon limits and earn rewards</p>
          </div>
          <Link to={createPageUrl("Track")}>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 text-white font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </Link>
        </div>

        {/* Global Alert */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Global CO₂ Levels Alert</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Atmospheric CO₂ reached approximately 423 ppm in 2024, up 3.5-3.75 ppm from last year. Stay under your daily limit to make a difference!
                </p>
              </div>
              <Globe className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Carbon Tracker */}
          <Card className={`border-2 ${isUnderLimit ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-semibold ${isUnderLimit ? 'text-emerald-700' : 'text-red-700'}`}>Today's Carbon</CardTitle>
                {isUnderLimit ? <TrendingDown className="w-5 h-5 text-emerald-500" /> : <TrendingUp className="w-5 h-5 text-red-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${isUnderLimit ? 'text-emerald-900' : 'text-red-900'}`}>{todayCO2.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">/ {progress.daily_carbon_limit} kg</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isUnderLimit ? `${carbonSavings.toFixed(1)} kg under limit! 🎉` : `${(todayCO2 - progress.daily_carbon_limit).toFixed(1)} kg over limit`}
                  </p>
                </div>
                <Progress 
                  value={Math.min(dailyProgress, 100)} 
                  className={`h-2 ${isUnderLimit ? 'bg-emerald-100' : 'bg-red-100'}`}
                />
                {todayReductions > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-xs text-emerald-700">✨ Reduced {todayReductions.toFixed(1)} kg today!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-orange-700">Current Streak</CardTitle>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-900">{progress.current_streak}</span>
                  <span className="text-sm text-gray-600">days</span>
                </div>
                <p className="text-xs text-gray-500">Under limit streak! 🔥</p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-teal-700">This Week</CardTitle>
                <Target className="w-5 h-5 text-teal-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-teal-900">{weekCO2.toFixed(0)}</span>
                  <span className="text-sm text-gray-600">/ {progress.weekly_carbon_limit} kg</span>
                </div>
                <p className="text-xs text-gray-500">{weekProgress.toFixed(0)}% of weekly limit</p>
              </div>
            </CardContent>
          </Card>

          {/* EcoPoints */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-purple-700">EcoPoints</CardTitle>
                <Award className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-900">{progress.eco_points}</span>
                  <span className="text-sm text-gray-600">pts</span>
                </div>
                <p className="text-xs text-gray-500">Earn more with challenges!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* This Week's Breakdown */}
          <Card className="lg:col-span-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">This Week's Footprint</CardTitle>
              <p className="text-sm text-gray-600">Your carbon emissions by category</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${weekCO2 <= progress.weekly_carbon_limit ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Total Carbon Footprint</p>
                    <p className="text-4xl font-bold mt-1">{weekCO2.toFixed(1)} kg</p>
                    <p className="text-sm opacity-75 mt-2">
                      {weekCO2 <= progress.weekly_carbon_limit 
                        ? `✓ ${(progress.weekly_carbon_limit - weekCO2).toFixed(1)} kg under weekly limit!`
                        : `⚠ ${(weekCO2 - progress.weekly_carbon_limit).toFixed(1)} kg over weekly limit`
                      }
                    </p>
                  </div>
                  <TreePine className="w-16 h-16 opacity-30" />
                </div>
              </div>

              {weekReductions > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">Great eco-friendly choices!</p>
                      <p className="text-sm text-emerald-700">You offset {weekReductions.toFixed(1)} kg this week through sustainable activities</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {Object.entries(categoryTotals).map(([category, total]) => {
                  const Icon = categoryIcons[category];
                  const percentage = (total / weekCO2) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{total.toFixed(1)} kg</span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-gray-100" />
                    </div>
                  );
                })}
                {Object.keys(categoryTotals).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No emissions logged this week. Great start!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Compete")}>
                  <Button variant="outline" className="w-full justify-between group hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold">Join Challenge</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Local")}>
                  <Button variant="outline" className="w-full justify-between group hover:bg-teal-50 hover:border-teal-300 transition-all">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold">Volunteer Events</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={createPageUrl("EcoBot")}>
                  <Button variant="outline" className="w-full justify-between group hover:bg-purple-50 hover:border-purple-300 transition-all">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Ask EcoBot</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Eco Tip */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-lg font-bold text-emerald-900">Today's Eco Tip</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The average American generates 30 kg of CO₂ daily. By staying under your limit and making eco-friendly choices, you're part of the solution!
                </p>
                <Badge className="mt-3 bg-emerald-100 text-emerald-700 border-emerald-200">Carbon Awareness</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
