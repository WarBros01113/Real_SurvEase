
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, FileText, Star, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  formsPosted: number;
  formsFilled: number;
  totalRatings: number;
  badges: string[];
}

interface FormFillerProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FormFillerProfileModal: React.FC<FormFillerProfileModalProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get forms posted count
      const { count: formsPosted } = await supabase
        .from('forms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get forms filled count
      const { count: formsFilled } = await supabase
        .from('form_fills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total ratings given
      const { count: totalRatings } = await supabase
        .from('form_fills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('rating', 'is', null);

      // Get badges
      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('badge_name')
        .eq('user_id', userId);

      setUserProfile({
        id: profile.id,
        name: profile.name,
        formsPosted: formsPosted || 0,
        formsFilled: formsFilled || 0,
        totalRatings: totalRatings || 0,
        badges: badgeData?.map(b => b.badge_name) || []
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Profile</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : userProfile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{userProfile.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <User className="w-4 h-4" />
                      <span>Community Member</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">{userProfile.formsPosted}</div>
                    <div className="text-sm text-emerald-700">Forms Posted</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-xl font-bold text-teal-600">{userProfile.formsFilled}</div>
                    <div className="text-sm text-teal-700">Forms Filled</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{userProfile.totalRatings}</div>
                    <div className="text-sm text-yellow-700">Ratings Given</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{userProfile.badges.length}</div>
                    <div className="text-sm text-purple-700">Badges Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            {userProfile.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {userProfile.badges.map((badge) => (
                      <div key={badge} className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">{badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Unable to load user profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormFillerProfileModal;
