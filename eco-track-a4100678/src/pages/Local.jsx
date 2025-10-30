
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Waves,
  TreePine,
  TestTube,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Info,
  Edit, // Added Edit icon
  Save, // Added Save icon
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const wildlifeData = {
  "Michigan": {
    endangered: [
      { name: "Piping Plover", habitat: "Great Lakes shorelines", threat: "Habitat loss", fact: "Only 70 breeding pairs remain in the Great Lakes" },
      { name: "Kirtland's Warbler", habitat: "Jack pine forests", threat: "Habitat destruction", fact: "Recovered from near extinction with only 167 singing males in 1974" },
      { name: "Gray Wolf", habitat: "Northern forests", threat: "Human conflict", fact: "Once extinct in Michigan, now recovering with ~700 individuals" },
      { name: "Eastern Massasauga Rattlesnake", habitat: "Wetlands and prairies", threat: "Habitat loss, persecution", fact: "Michigan's only venomous snake, listed as federally threatened since 2016" },
      { name: "Northern Long-eared Bat", habitat: "Forests and caves", threat: "White-nose syndrome", fact: "Population declined 97% in some areas due to fungal disease" },
      { name: "Lake Sturgeon", habitat: "Great Lakes and rivers", threat: "Overfishing, dams", fact: "Can live over 100 years and grow to 300+ pounds, once near extinction" },
      { name: "Karner Blue Butterfly", habitat: "Oak savannas", threat: "Habitat destruction", fact: "Depends entirely on wild lupine plants for survival" },
      { name: "Eastern Fox Snake", habitat: "Wetlands near Great Lakes", threat: "Habitat loss, killed by humans", fact: "Often mistaken for rattlesnakes despite being harmless" },
      { name: "Blanding's Turtle", habitat: "Wetlands and woodlands", threat: "Road mortality, habitat loss", fact: "Can live over 75 years but takes 15-20 years to reach breeding age" },
    ],
    invasive: [
      { name: "Zebra Mussel", origin: "Eurasia", impact: "Clogs water infrastructure, outcompetes native species", cost: "$500M annually in Great Lakes" },
      { name: "Sea Lamprey", origin: "Atlantic Ocean", impact: "Parasitizes native fish, decimated lake trout", cost: "Killed 100+ million lbs of fish annually before control" },
      { name: "Asian Carp", origin: "Asia", impact: "Threatens to disrupt entire food chain", cost: "Could cause $7B in economic damage" },
      { name: "Emerald Ash Borer", origin: "Asia", impact: "Kills ash trees, destroyed millions of trees", cost: "Over $10B in damages and removal costs nationwide" },
      { name: "Phragmites (Common Reed)", origin: "Europe", impact: "Forms dense monocultures, eliminates native wetland plants", cost: "Reduces property values and wildlife habitat quality" },
      { name: "Purple Loosestrife", origin: "Europe", impact: "Chokes out native wetland vegetation", cost: "Costs millions in control efforts and lost wildlife habitat" },
      { name: "Round Goby", origin: "Black and Caspian Seas", impact: "Competes with native fish, eats their eggs", cost: "Disrupted $7B Great Lakes fishing industry" },
      { name: "Eurasian Watermilfoil", origin: "Europe and Asia", impact: "Forms dense mats, impedes boating and swimming", cost: "Millions spent annually on aquatic plant management" },
      { name: "Feral Swine", origin: "Domestic/Eurasian wild boar", impact: "Destroys crops, spreads disease, damages ecosystems", cost: "$2.5B in damages annually across U.S." },
      { name: "Autumn Olive", origin: "Asia", impact: "Outcompetes native shrubs, alters soil chemistry", cost: "Difficult and expensive to control once established" },
    ]
  },
  "California": { // Added California data
    endangered: [
      { name: "California Condor", habitat: "Mountains, canyons", threat: "Lead poisoning", fact: "Largest land bird in North America, once critically endangered" },
      { name: "Delta Smelt", habitat: "Sacramento-San Joaquin Delta", threat: "Habitat loss, water diversions", fact: "Small fish, indicator of the health of the San Francisco Bay-Delta ecosystem" },
      { name: "Giant Garter Snake", habitat: "Central Valley wetlands", threat: "Habitat loss", fact: "Non-venomous snake, relies on marshy areas" },
      { name: "Blunt-nosed Leopard Lizard", habitat: "San Joaquin Valley grasslands", threat: "Habitat destruction", fact: "Endemic to California, one of the fastest lizards" },
      { name: "San Joaquin Kit Fox", habitat: "San Joaquin Valley grasslands", threat: "Habitat loss", fact: "Smallest fox species in North America" },
    ],
    invasive: [
      { name: "Quagga Mussel", origin: "Ukraine", impact: "Clogs pipes, impacts water quality", cost: "Millions in control and damage" },
      { name: "Nutria", origin: "South America", impact: "Destroys wetlands, undermines infrastructure", cost: "Significant agricultural damage" },
      { name: "Arundo Donax (Giant Reed)", origin: "Mediterranean", impact: "Outcompetes native plants, increases fire risk", cost: "Dominates riparian areas" },
      { name: "New Zealand Mud Snail", origin: "New Zealand", impact: "Outcompetes native invertebrates, alters food web", cost: "Impacts trout and salmon populations" },
      { name: "Red Imported Fire Ant", origin: "South America", impact: "Damages agriculture, harms native wildlife and humans", cost: "Billions in damages and medical costs nationwide" },
    ]
  },
  "Default": { // Added Default data for other locations
    endangered: [
      { name: "No specific data", habitat: "N/A", threat: "N/A", fact: "Select a specific location to see local wildlife." }
    ],
    invasive: [
      { name: "No specific data", origin: "N/A", impact: "N/A", cost: "Select a specific location to see local wildlife." }
    ]
  }
};

export default function Local() {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [localAreaLocation, setLocalAreaLocation] = useState("Northville, Michigan"); // For wildlife data, separate from user profile
  const [wildlifeQuizScore, setWildlifeQuizScore] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserLocation(u.location || ""); // Set userLocation from user profile
    }).catch(() => {});
  }, []);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['volunteerEvents'],
    queryFn: () => base44.entities.VolunteerEvent.list('-date'),
    initialData: [],
  });

  const registerEventMutation = useMutation({
    mutationFn: ({ eventId, registeredUsers }) =>
      base44.entities.VolunteerEvent.update(eventId, { registered_users: registeredUsers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteerEvents'] });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: (newLocation) => base44.auth.update({ location: newLocation }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setUserLocation(updatedUser.location);
      setIsEditingLocation(false);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // Invalidate user profile query if you have one
    },
    onError: (error) => {
      console.error("Failed to update user location:", error);
      // Optionally, show an error message to the user
    },
  });

  const handleRegisterEvent = (event) => {
    if (!user) return;
    const registered = event.registered_users || [];
    if (registered.includes(user.email)) return;

    registerEventMutation.mutate({
      eventId: event.id,
      registeredUsers: [...registered, user.email]
    });
  };

  const handleSaveLocation = () => {
    if (userLocation.trim() !== "" && userLocation !== user?.location) {
      updateLocationMutation.mutate(userLocation);
    } else {
      setIsEditingLocation(false); // Just close editing if no change or empty
    }
  };

  const eventTypeColors = {
    beach_cleanup: "bg-blue-100 text-blue-700 border-blue-200",
    water_quality: "bg-cyan-100 text-cyan-700 border-cyan-200",
    habitat_restoration: "bg-green-100 text-green-700 border-green-200",
    education: "bg-purple-100 text-purple-700 border-purple-200",
    tree_planting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const eventTypeIcons = {
    beach_cleanup: Waves,
    water_quality: TestTube,
    habitat_restoration: TreePine,
    education: BookOpen,
    tree_planting: TreePine,
  };

  // Determine which wildlife data to show based on LOCAL selection (not user profile)
  const selectedState = localAreaLocation.toLowerCase().includes("michigan") ? "Michigan"
    : localAreaLocation.toLowerCase().includes("california") ? "California"
      : "Default";

  const wildlife = wildlifeData[selectedState];
  const allSpecies = [...wildlife.endangered, ...wildlife.invasive];

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prev) => (prev + 1) % allSpecies.length);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Local Action Hub
            </h1>
            <p className="text-gray-600 mt-1">Connect with your community and protect local ecosystems</p>
          </div>
        </div>

        {/* Location Selector */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Location
              </CardTitle>
              {!isEditingLocation ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingLocation(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveLocation}
                  disabled={updateLocationMutation.isPending}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingLocation ? (
              <div className="space-y-2">
                <Label htmlFor="location">City, State or Region</Label>
                <Input
                  id="location"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="e.g., Detroit, Michigan or San Francisco, California"
                  className="text-lg"
                />
                <p className="text-xs text-blue-700">
                  Enter your location to see relevant local wildlife and volunteer events
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <p className="text-lg font-semibold text-blue-900">
                  {userLocation || "Location not set - Click Edit to add your location"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="volunteer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="volunteer" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <MapPin className="w-4 h-4" />
              <span>Volunteer Events</span>
            </TabsTrigger>
            <TabsTrigger value="wildlife" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <TreePine className="w-4 h-4" />
              <span>Wildlife Challenge</span>
            </TabsTrigger>
          </TabsList>

          {/* Volunteer Events Tab */}
          <TabsContent value="volunteer" className="space-y-6 mt-6">
            {/* Great Lakes Info Banner */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Waves className="w-12 h-12 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-blue-900 mb-2">Great Lakes Conservation</h3>
                    <p className="text-sm text-blue-800 leading-relaxed mb-3">
                      The Great Lakes contain 21% of the world's surface fresh water and provide drinking water for 35 million people.
                      Your participation in local conservation efforts helps protect this invaluable resource for future generations.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="font-semibold text-blue-900">3,500+</p>
                        <p className="text-blue-700 text-xs">Species</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="font-semibold text-blue-900">84%</p>
                        <p className="text-blue-700 text-xs">Fresh Water</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="font-semibold text-blue-900">35M</p>
                        <p className="text-blue-700 text-xs">People Served</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="font-semibold text-blue-900">5 Lakes</p>
                        <p className="text-blue-700 text-xs">Ecosystem</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => {
                const Icon = eventTypeIcons[event.event_type] || MapPin;
                const isRegistered = event.registered_users?.includes(user?.email);
                const spotsLeft = (event.max_participants || 0) - (event.registered_users?.length || 0);

                return (
                  <Card key={event.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">{event.title}</CardTitle>
                            <Badge className={`${eventTypeColors[event.event_type]} mt-1`} variant="outline">
                              {event.event_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{event.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{event.location}, {event.region}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{event.time} ({event.duration_hours}h)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>{event.registered_users?.length || 0} registered {event.max_participants && `• ${spotsLeft} spots left`}</span>
                        </div>
                      </div>

                      {event.impact_description && (
                        <Alert className="border-emerald-200 bg-emerald-50">
                          <Info className="h-4 w-4 text-emerald-600" />
                          <AlertDescription className="text-emerald-900 text-sm">
                            {event.impact_description}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={() => handleRegisterEvent(event)}
                        disabled={isRegistered || registerEventMutation.isPending || (event.max_participants && spotsLeft <= 0)}
                        className={`w-full ${
                          isRegistered
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registered
                          </>
                        ) : (
                          <>
                            Sign Up {event.eco_points_reward && `• +${event.eco_points_reward} pts`}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {events.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events yet. Check back soon!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Wildlife Challenge Tab */}
          <TabsContent value="wildlife" className="space-y-6 mt-6">
            {/* Wildlife Area Selector */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Explore Wildlife By Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="wildlife-location">Select Area to Explore</Label>
                  <select
                    id="wildlife-location"
                    value={localAreaLocation}
                    onChange={(e) => {
                      setLocalAreaLocation(e.target.value);
                      setCurrentCardIndex(0);
                      setShowAnswer(false);
                    }}
                    className="w-full p-3 rounded-lg border-2 border-emerald-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Northville, Michigan">Northville, Michigan</option>
                    <option value="Detroit, Michigan">Detroit, Michigan</option>
                    <option value="Ann Arbor, Michigan">Ann Arbor, Michigan</option>
                    <option value="Traverse City, Michigan">Traverse City, Michigan</option>
                    <option value="San Francisco, California">San Francisco, California</option>
                    <option value="Los Angeles, California">Los Angeles, California</option>
                    <option value="Other Location">Other Location</option>
                  </select>
                  <p className="text-xs text-emerald-700">
                    Learn about endangered and invasive species in different regions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-purple-700">Challenge Score</h3>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{wildlifeQuizScore} pts</p>
                  </div>
                  <TreePine className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* Flashcard */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {localAreaLocation} Wildlife Flashcards
                  </CardTitle>
                  <Badge variant="outline" className="bg-gray-100">
                    {currentCardIndex + 1} / {allSpecies.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={flipCard}
                  className="relative h-64 cursor-pointer perspective-1000"
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${showAnswer ? 'rotate-y-180' : ''}`}>
                    {/* Front of card */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-xl ${showAnswer ? 'hidden' : ''}`}>
                      <h3 className="text-3xl font-bold text-center mb-4">
                        {allSpecies[currentCardIndex].name}
                      </h3>
                      <p className="text-emerald-100 text-sm">Click to reveal details</p>
                    </div>

                    {/* Back of card */}
                    <div className={`absolute inset-0 bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl ${!showAnswer ? 'hidden' : ''}`}>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900">{allSpecies[currentCardIndex].name}</h3>

                        {currentCardIndex < wildlife.endangered.length ? (
                          <>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Endangered Species
                            </Badge>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Habitat: </span>
                                <span className="text-gray-600">{allSpecies[currentCardIndex].habitat}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Primary Threat: </span>
                                <span className="text-gray-600">{allSpecies[currentCardIndex].threat}</span>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg mt-3">
                                <p className="text-sm text-blue-900"><strong>Did you know?</strong> {allSpecies[currentCardIndex].fact}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Invasive Species
                            </Badge>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Origin: </span>
                                <span className="text-gray-600">{allSpecies[currentCardIndex].origin}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Impact: </span>
                                <span className="text-gray-600">{allSpecies[currentCardIndex].impact}</span>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg mt-3">
                                <p className="text-sm text-orange-900"><strong>Economic Cost:</strong> {allSpecies[currentCardIndex].cost}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={nextCard}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    Next Card
                  </Button>
                  <Button
                    onClick={() => setWildlifeQuizScore(prev => prev + 5)}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Mark as Learned (+5 pts)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wildlife Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Endangered Species ({wildlife.endangered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {wildlife.endangered.map((species, index) => (
                      <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span><strong>{species.name}</strong> - {species.habitat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Invasive Species ({wildlife.invasive.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {wildlife.invasive.map((species, index) => (
                      <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span><strong>{species.name}</strong> - from {species.origin}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
