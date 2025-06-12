
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Users, Star, Award, PlusCircle, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import RecentActivity from '@/components/RecentActivity';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const stats = [
    {
      title: 'Forms Posted',
      value: user.formsPosted,
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'blue' as const
    },
    {
      title: 'Forms Filled',
      value: user.formsFilled,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      title: 'Ratings Given',
      value: user.totalRatings,
      icon: <Star className="w-5 h-5" />,
      color: 'yellow' as const
    },
    {
      title: 'Badges Earned',
      value: user.badges.length,
      icon: <Award className="w-5 h-5" />,
      color: 'purple' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-600">Here's your SurvEase activity overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Badges Section */}
        <Card className="lg:col-span-1 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Award className="w-5 h-5 text-emerald-600" />
              Your Badges
            </CardTitle>
            <CardDescription>Achievements you've unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.badges.length > 0 ? (
                user.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {badge}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No badges earned yet. Start filling forms to unlock achievements!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions on SurvEase</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Quick Actions</CardTitle>
          <CardDescription>What would you like to do today?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/post-form')}
              className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <PlusCircle className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-emerald-900">Post New Form</h3>
              <p className="text-sm text-emerald-700">Share a Google Form with the community</p>
            </div>
            <div 
              onClick={() => navigate('/feed')}
              className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <BarChart3 className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="font-semibold text-teal-900">Browse Forms</h3>
              <p className="text-sm text-teal-700">Discover and fill interesting forms</p>
            </div>
            <div 
              onClick={() => navigate('/leaderboard')}
              className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <Users className="w-8 h-8 text-slate-600 mb-3" />
              <h3 className="font-semibold text-slate-900">View Leaderboard</h3>
              <p className="text-sm text-slate-700">See how you rank among other users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
