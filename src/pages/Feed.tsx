
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormCard from '@/components/FormCard';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Form {
  id: string;
  title: string;
  description: string;
  google_form_url: string;
  tags: string[];
  created_at: string;
  expire_at: string | null;
  user_id: string;
  profiles: {
    name: string;
  } | null;
  form_fills: {
    rating: number;
  }[];
}

const Feed = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('all');
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching forms...');

      // First get forms with form_fills
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select(`
          *,
          form_fills (rating)
        `)
        .order('created_at', { ascending: false });

      if (formsError) {
        console.error('Forms error:', formsError);
        throw formsError;
      }

      console.log('Forms data:', formsData);

      if (!formsData || formsData.length === 0) {
        console.log('No forms found');
        setForms([]);
        return;
      }

      // Then get profiles for each form's user_id
      const formsWithProfiles = await Promise.all(
        formsData.map(async (form) => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', form.user_id)
              .maybeSingle();

            if (profileError) {
              console.warn('Profile error for user', form.user_id, ':', profileError);
            }

            return {
              ...form,
              profiles: profile || { name: 'Unknown User' }
            };
          } catch (err) {
            console.warn('Error fetching profile for form', form.id, ':', err);
            return {
              ...form,
              profiles: { name: 'Unknown User' }
            };
          }
        })
      );

      console.log('Forms with profiles:', formsWithProfiles);
      setForms(formsWithProfiles);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error instanceof Error ? error.message : 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const availableTags = ['all', 'survey', 'research', 'feedback', 'academic', 'business', 'personal'];

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = filterTag === 'all' || (form.tags && form.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  const sortedForms = [...filteredForms].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating':
        const aRating = a.form_fills.length > 0 ? 
          a.form_fills.reduce((sum, fill) => sum + fill.rating, 0) / a.form_fills.length : 0;
        const bRating = b.form_fills.length > 0 ? 
          b.form_fills.reduce((sum, fill) => sum + fill.rating, 0) / b.form_fills.length : 0;
        return bRating - aRating;
      case 'expiring':
        if (!a.expire_at && !b.expire_at) return 0;
        if (!a.expire_at) return 1;
        if (!b.expire_at) return -1;
        return new Date(a.expire_at).getTime() - new Date(b.expire_at).getTime();
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200 shadow-lg max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error loading forms</p>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button 
              onClick={fetchForms}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Form Feed
          </h1>
          <p className="text-slate-600">Discover and fill interesting forms from the community</p>
        </div>
        <Button 
          onClick={fetchForms}
          variant="outline"
          className="border-emerald-200"
        >
          Refresh
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 border-slate-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-full md:w-48 border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag === 'all' ? 'All Tags' : tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedForms.map(form => {
          const averageRating = form.form_fills.length > 0 ? 
            form.form_fills.reduce((sum, fill) => sum + fill.rating, 0) / form.form_fills.length : 0;
          
          return (
            <FormCard 
              key={form.id}
              id={form.id}
              title={form.title}
              description={form.description || ''}
              tags={form.tags || []}
              createdAt={form.created_at}
              expireAt={form.expire_at}
              googleFormUrl={form.google_form_url}
              fillCount={form.form_fills.length}
              averageRating={averageRating}
              onFormFilled={fetchForms}
            />
          );
        })}
      </div>

      {sortedForms.length === 0 && !loading && (
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="text-center py-12">
            <p className="text-slate-500 text-lg">No forms found matching your criteria.</p>
            <p className="text-slate-400 mb-6">Try adjusting your search or filters, or post the first form!</p>
            {session && (
              <Button 
                onClick={() => window.location.href = '/post-form'}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Post the First Form
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Feed;
