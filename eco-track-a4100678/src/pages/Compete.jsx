import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Target, Sparkles, Users, Calendar, TrendingUp, Award, Brain, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Compete() {
  const [user, setUser] = useState(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list('-eco_points'),
    initialData: [],
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date'),
    initialData: [],
  });

  const { data: triviaQuestions = [], isLoading: triviaLoading } = useQuery({
    queryKey: ['triviaQuestions'],
    queryFn: () => base44.entities.TriviaQuestion.list(),
    initialData: [],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const joinChallengeMutation = useMutation({
    mutationFn: ({ challengeId, participants }) => 
      base44.entities.Challenge.update(challengeId, { participants }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ progressId, data }) => 
      base44.entities.UserProgress.update(progressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProgress'] });
    },
  });

  const currentUserProgress = userProgress[0];
  const userRank = allProgress.findIndex(p => p.user_email === user?.email) + 1;

  const handleJoinChallenge = (challenge) => {
    if (!user || !challenge.participants) return;
    const participants = challenge.participants || [];
    if (participants.includes(user.email)) return;
    
    joinChallengeMutation.mutate({
      challengeId: challenge.id,
      participants: [...participants, user.email]
    });
  };

  const loadNewQuestion = () => {
    if (triviaQuestions.length === 0) return;
    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answer) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    if (answer === currentQuestion.correct_answer) {
      setTriviaScore(prev => prev + (currentQuestion.eco_points || 10));
      
      // Update user progress
      if (currentUserProgress) {
        updateProgressMutation.mutate({
          progressId: currentUserProgress.id,
          data: {
            eco_points: (currentUserProgress.eco_points || 0) + (currentQuestion.eco_points || 10)
          }
        });
      }
    }
  };

  useEffect(() => {
    if (triviaQuestions.length > 0 && !currentQuestion) {
      loadNewQuestion();
    }
  }, [triviaQuestions]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    hard: "bg-red-100 text-red-700 border-red-200"
  };

  const categoryColors = {
    transport: "bg-blue-100 text-blue-700",
    energy: "bg-yellow-100 text-yellow-700",
    diet: "bg-green-100 text-green-700",
    shopping: "bg-purple-100 text-purple-700",
    community: "bg-pink-100 text-pink-700",
    learning: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Compete & Earn
          </h1>
          <p className="text-gray-600 mt-1">Challenge yourself and climb the leaderboard</p>
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="trivia" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Trivia</span>
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4 mt-6">
            {user && currentUserProgress && (
              <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        #{userRank}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Your Rank</p>
                        <p className="text-2xl font-bold text-gray-900">{currentUserProgress.eco_points} pts</p>
                      </div>
                    </div>
                    <Award className="w-12 h-12 text-emerald-500 opacity-30" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Eco-Warriors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allProgress.slice(0, 10).map((progress, index) => {
                    const isCurrentUser = progress.user_email === user?.email;
                    const rankColors = ['bg-gradient-to-r from-yellow-400 to-yellow-500', 'bg-gradient-to-r from-gray-300 to-gray-400', 'bg-gradient-to-r from-orange-400 to-orange-500'];
                    
                    return (
                      <div 
                        key={progress.id} 
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isCurrentUser ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-10 h-10 ${index < 3 ? rankColors[index] : 'bg-gray-200'} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                          {index < 3 ? <Medal className="w-5 h-5" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {progress.user_email.split('@')[0]}
                            {isCurrentUser && <span className="text-emerald-600 text-sm ml-2">(You)</span>}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>🔥 {progress.current_streak} day streak</span>
                            <span>🌳 {(progress.total_co2_saved / 21).toFixed(1)} trees</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">{progress.eco_points}</p>
                          <p className="text-xs text-gray-500">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((challenge) => {
                const isParticipant = challenge.participants?.includes(user?.email);
                const participantCount = challenge.participants?.length || 0;
                
                return (
                  <Card key={challenge.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900">{challenge.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                        <Badge className={difficultyColors[challenge.difficulty]} variant="outline">
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={categoryColors[challenge.category]}>
                          {challenge.category}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {challenge.eco_points} pts
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Calendar className="w-3 h-3 mr-1" />
                          {challenge.duration_days} days
                        </Badge>
                      </div>

                      {challenge.co2_target && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">CO₂ Target</span>
                            <span className="font-semibold text-emerald-600">{challenge.co2_target} kg</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{participantCount} participants</span>
                      </div>

                      <Button
                        onClick={() => handleJoinChallenge(challenge)}
                        disabled={isParticipant || joinChallengeMutation.isPending}
                        className={`w-full ${
                          isParticipant 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                        }`}
                      >
                        {isParticipant ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Joined
                          </>
                        ) : (
                          'Join Challenge'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {challenges.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No challenges available yet. Check back soon!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trivia Tab */}
          <TabsContent value="trivia" className="space-y-4 mt-6">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-purple-700">Session Score</h3>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{triviaScore} pts</p>
                  </div>
                  <Brain className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {currentQuestion && (
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={difficultyColors[currentQuestion.difficulty]} variant="outline">
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {currentQuestion.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mt-4">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentQuestion.correct_answer;
                      
                      let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                      if (!showAnswer) {
                        buttonClass += "hover:border-emerald-300 hover:bg-emerald-50 border-gray-200";
                      } else if (isCorrect) {
                        buttonClass += "border-emerald-500 bg-emerald-50";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += "border-red-500 bg-red-50";
                      } else {
                        buttonClass += "border-gray-200 opacity-50";
                      }
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={showAnswer}
                          className={buttonClass}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showAnswer && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className={`p-4 rounded-xl ${
                        selectedAnswer === currentQuestion.correct_answer 
                          ? 'bg-emerald-50 border border-emerald-200' 
                          : 'bg-orange-50 border border-orange-200'
                      }`}>
                        <p className="font-semibold text-sm mb-2">
                          {selectedAnswer === currentQuestion.correct_answer ? '✨ Correct!' : '❌ Incorrect'}
                        </p>
                        <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                      </div>

                      {currentQuestion.fun_fact && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                          <p className="font-semibold text-sm text-blue-900 mb-1">💡 Fun Fact</p>
                          <p className="text-sm text-blue-800">{currentQuestion.fun_fact}</p>
                        </div>
                      )}

                      <Button
                        onClick={loadNewQuestion}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                      >
                        Next Question
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {triviaQuestions.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No trivia questions available yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}