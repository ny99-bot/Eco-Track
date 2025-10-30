
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Award, 
  TrendingDown, 
  Flame, 
  Target, 
  TreePine, 
  Trophy,
  Edit,
  Save,
  X
} from "lucide-react";

const badgesList = [
  { name: "First Steps", icon: "🌱", description: "Log your first activity", requirement: 1 },
  { name: "Week Warrior", icon: "🔥", description: "Maintain a 7-day streak", requirement: 7 },
  { name: "Tree Planter", icon: "🌳", description: "Save CO₂ equivalent of 10 trees", requirement: 210 },
  { name: "Century Club", icon: "💯", description: "Earn 100 EcoPoints", requirement: 100 },
  { name: "Community Hero", icon: "🤝", description: "Join 3 volunteer events", requirement: 3 },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: userProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list('-eco_points'),
    enabled: !!user,
    initialData: [],
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ progressId, goal }) => 
      base44.entities.UserProgress.update(progressId, { daily_goal: parseFloat(goal) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      setIsEditingGoal(false);
    },
  });

  const progress = userProgress[0] || {
    eco_points: 0,
    total_co2_saved: 0,
    total_carbon_footprint: 0,
    current_streak: 0,
    longest_streak: 0,
    daily_goal: 5,
    badges: []
  };

  // Add sample data if user has no progress yet
  const displayProgress = {
    eco_points: progress.eco_points || 95,
    total_co2_saved: progress.total_co2_saved || 5,
    total_carbon_footprint: progress.total_carbon_footprint || 145.2,
    current_streak: progress.current_streak || 2,
    longest_streak: progress.longest_streak || 28,
    daily_goal: progress.daily_goal || 5,
    badges: progress.badges || []
  };

  const userRank = allProgress.findIndex(p => p.user_email === user?.email) + 1;
  const displayRank = userRank > 0 ? userRank : 47;
  
  // Use custom display values when showing sample data (5kg CO2 = 1 tree over 2 days)
  const treesEquivalent = progress.total_co2_saved > 0 
    ? (displayProgress.total_co2_saved / 5).toFixed(1)
    : "1.0";
  const milesOffset = progress.total_co2_saved > 0 
    ? (displayProgress.total_co2_saved * 2.3).toFixed(0)
    : "15";

  const handleSaveGoal = () => {
    if (progress.id && newGoal && parseFloat(newGoal) > 0) {
      updateGoalMutation.mutate({
        progressId: progress.id,
        goal: newGoal
      });
    }
  };

  const categoryBreakdown = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + Math.abs(activity.co2_impact || 0);
    return acc;
  }, {});

  // Add sample category data if empty
  const displayCategories = Object.keys(categoryBreakdown).length > 0 ? categoryBreakdown : {
    transport: 42.3,
    energy: 28.7,
    diet: 35.6,
    shopping: 18.9
  };

  const totalCO2 = Object.values(displayCategories).reduce((sum, val) => sum + val, 0);
  
  const displayActivities = activities.length > 0 ? activities : [];
  const displayActivityCount = activities.length > 0 ? activities.length : 34;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {user?.full_name || 'User'}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-emerald-700">Total Saved</CardTitle>
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-900">{displayProgress.total_co2_saved.toFixed(1)}</span>
                  <span className="text-sm text-gray-600">kg CO₂</span>
                </div>
                <p className="text-xs text-gray-500">≈ {treesEquivalent} trees</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-orange-700">Current Streak</CardTitle>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-900">{displayProgress.current_streak}</span>
                  <span className="text-sm text-gray-600">days</span>
                </div>
                <p className="text-xs text-gray-500">Best: {displayProgress.longest_streak} days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-purple-700">EcoPoints</CardTitle>
                <Award className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-900">{displayProgress.eco_points}</span>
                  <span className="text-sm text-gray-600">pts</span>
                </div>
                <p className="text-xs text-gray-500">{displayActivityCount} activities</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-blue-700">Miles Offset</CardTitle>
                <TreePine className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-900">{milesOffset}</span>
                  <span className="text-sm text-gray-600">miles</span>
                </div>
                <p className="text-xs text-gray-500">Car emissions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Goal */}
          <Card className="lg:col-span-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  Daily Goal
                </CardTitle>
                {!isEditingGoal ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingGoal(true);
                      setNewGoal(displayProgress.daily_goal.toString());
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingGoal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveGoal}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingGoal ? (
                <div className="space-y-2">
                  <Label htmlFor="goal">Daily CO₂ Reduction Goal (kg)</Label>
                  <Input
                    id="goal"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="text-lg"
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium opacity-90">Current Goal</p>
                      <p className="text-4xl font-bold mt-1">{displayProgress.daily_goal} kg</p>
                    </div>
                    <Target className="w-12 h-12 opacity-30" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Today's Progress</span>
                      <span className="font-semibold">
                        {displayActivities.filter(a => a.date === new Date().toISOString().split('T')[0])
                          .reduce((sum, a) => sum + Math.abs(a.co2_impact || 0), 0).toFixed(1) || '3.2'} kg
                      </span>
                    </div>
                    <Progress 
                      value={displayActivities.length > 0 
                        ? Math.min((displayActivities.filter(a => a.date === new Date().toISOString().split('T')[0])
                          .reduce((sum, a) => sum + Math.abs(a.co2_impact || 0), 0) / displayProgress.daily_goal) * 100, 100)
                        : 64
                      }
                      className="h-2 bg-white/30"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {displayActivities.filter(a => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(a.date) >= weekAgo;
                    }).reduce((sum, a) => sum + Math.abs(a.co2_impact || 0), 0).toFixed(1) || '24.8'} kg
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {displayActivities.filter(a => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return new Date(a.date) >= monthAgo;
                    }).reduce((sum, a) => sum + Math.abs(a.co2_impact || 0), 0).toFixed(1) || '98.3'} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Breakdown */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Impact Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(displayCategories).map(([category, amount]) => {
                const percentage = totalCO2 > 0 ? (amount / totalCO2) * 100 : 0;
                const colors = {
                  transport: "bg-blue-500",
                  energy: "bg-yellow-500",
                  diet: "bg-green-500",
                  shopping: "bg-purple-500"
                };
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium text-gray-700">{category}</span>
                      <span className="font-semibold text-gray-900">{amount.toFixed(1)} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/*
                       * The previous code had `className={`h-2 flex-1`}` without dynamic coloring.
                       * Adding dynamic class based on the 'colors' map.
                       */}
                      <Progress 
                        value={percentage} 
                        className={`h-2 flex-1 ${colors[category] || "bg-gray-400"}`} 
                      />
                      <span className="text-xs text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(displayCategories).length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">Start logging activities to see your breakdown!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Badges & Achievements */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {badgesList.map((badge, index) => {
                const isEarned = displayProgress.badges?.some(b => b.name === badge.name);
                
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isEarned 
                        ? 'border-emerald-300 bg-emerald-50 shadow-md' 
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-2 ${isEarned ? 'animate-bounce' : 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1">{badge.name}</h3>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                      {isEarned && (
                        <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-xs">
                          Earned ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
