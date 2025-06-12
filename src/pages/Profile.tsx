
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Edit, FileText, BarChart3, Star, Award } from 'lucide-react';
import PostedForms from '@/components/PostedForms';
import RecentActivity from '@/components/RecentActivity';
import EditProfileModal from '@/components/EditProfileModal';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  formsPosted: number;
  formsFilled: number;
  totalRatings: number;
  badges: string[];
}

const Profile = () => {
  const { user, session } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    formsPosted: 0,
    formsFilled: 0,
    totalRatings: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      
      // Get forms posted by user
      const { data: postedForms, error: formsError } = await supabase
        .from('forms')
        .select('id')
        .eq('user_id', session.user.id);

      if (formsError) throw formsError;

      // Get forms filled by user
      const { data: filledForms, error: fillsError } = await supabase
        .from('form_fills')
        .select('id, rating')
        .eq('user_id', session.user.id);

      if (fillsError) throw fillsError;

      // Get user badges
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_name')
        .eq('user_id', session.user.id);

      if (badgesError) throw badgesError;

      const ratingsGiven = filledForms?.filter(fill => fill.rating !== null).length || 0;

      setUserStats({
        formsPosted: postedForms?.length || 0,
        formsFilled: filledForms?.length || 0,
        totalRatings: ratingsGiven,
        badges: badges?.map(b => b.badge_name) || []
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [session]);

  const getBadgeProgress = () => {
    const { formsPosted, formsFilled } = userStats;
    
    if (formsFilled < 1) return "Fill your first form to earn the 'First Form Filled' badge!";
    if (formsFilled < 5) return `Fill ${5 - formsFilled} more forms to earn the 'Form Enthusiast' badge!`;
    if (formsFilled < 10) return `Fill ${10 - formsFilled} more forms to earn the 'Form Master' badge!`;
    if (formsPosted < 1) return "Post your first form to earn the 'Form Creator' badge!";
    
    return "You're doing great! Keep engaging with forms to earn more badges.";
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{userStats.formsPosted}</div>
                    <div className="text-sm text-gray-600">Forms Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{userStats.formsFilled}</div>
                    <div className="text-sm text-gray-600">Forms Filled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{userStats.totalRatings}</div>
                    <div className="text-sm text-gray-600">Ratings Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.badges.length}</div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="posted" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posted" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Posted Forms
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posted" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Posted Forms
              </CardTitle>
              <CardDescription>
                Forms you have posted and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostedForms />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest form interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Badges
              </CardTitle>
              <CardDescription>Achievements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {userStats.badges.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {userStats.badges.map((badge) => (
                      <div key={badge} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-800">{badge}</span>
                        </div>
                        <p className="text-sm text-yellow-700">Achievement unlocked!</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700">{getBadgeProgress()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No badges earned yet</p>
                  <p className="text-sm text-gray-400">{getBadgeProgress()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
              <CardDescription>Your engagement overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{userStats.formsFilled}</div>
                  <div className="text-sm text-blue-700">Total Forms Filled</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">{userStats.formsPosted}</div>
                  <div className="text-sm text-emerald-700">Total Forms Posted</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalRatings}</div>
                  <div className="text-sm text-purple-700">Total Ratings Given</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </div>
  );
};

export default Profile;
