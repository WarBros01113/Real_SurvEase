
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Star, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityItem {
  id: string;
  type: 'form_filled' | 'form_posted';
  title: string;
  date: string;
  rating?: number;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchRecentActivity = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      
      // Get recent form fills
      const { data: formFills, error: fillsError } = await supabase
        .from('form_fills')
        .select(`
          id,
          rating,
          created_at,
          forms (title)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fillsError) throw fillsError;

      // Get recent form posts
      const { data: formPosts, error: postsError } = await supabase
        .from('forms')
        .select('id, title, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;

      // Combine and sort activities
      const allActivities: ActivityItem[] = [
        ...(formFills?.map(fill => ({
          id: fill.id,
          type: 'form_filled' as const,
          title: fill.forms?.title || 'Unknown Form',
          date: fill.created_at,
          rating: fill.rating
        })) || []),
        ...(formPosts?.map(post => ({
          id: post.id,
          type: 'form_posted' as const,
          title: post.title,
          date: post.created_at
        })) || [])
      ];

      // Sort by date and take most recent 10
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(allActivities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No recent activity yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start by posting or filling forms to see your activity here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activity.type === 'form_filled' ? (
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={
                        activity.type === 'form_filled' 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-emerald-100 text-emerald-800"
                      }
                    >
                      {activity.type === 'form_filled' ? 'Filled' : 'Posted'}
                    </Badge>
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{activity.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(activity.date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentActivity;
