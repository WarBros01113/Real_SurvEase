
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { session, user } = useAuth();

  // Fill dummy data for testing
  const fillDummyData = () => {
    setTitle('Simple Feedback Form');
    setDescription('A simple form to collect feedback from users about our services');
    setFormUrl('https://forms.google.com/example-form');
    setTags(['feedback', 'survey']);
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  };

  if (!session || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Please log in to post forms</h2>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Session:', session);
    console.log('User:', user);
    
    if (!title || !description || !formUrl || !expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!session?.user) {
      toast.error('You must be logged in to post a form');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Inserting form with data:', {
        user_id: session.user.id,
        title,
        description,
        google_form_url: formUrl,
        tags,
        expire_at: expiryDate.toISOString()
      });

      const { data, error } = await supabase
        .from('forms')
        .insert({
          user_id: session.user.id,
          title,
          description,
          google_form_url: formUrl,
          tags,
          expire_at: expiryDate.toISOString()
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Form posted successfully:', data);
      toast.success('Form posted successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('Error posting form:', error);
      toast.error(`Failed to post form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Post a New Form</CardTitle>
          <CardDescription>
            Share your Google Form with the SurvEase community
          </CardDescription>
          <Button 
            type="button" 
            onClick={fillDummyData}
            variant="outline"
            className="self-start"
          >
            Fill Dummy Data (for testing)
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your form"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what your form is about and why people should fill it"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formUrl">Google Form URL *</Label>
              <Input
                id="formUrl"
                type="url"
                placeholder="https://forms.google.com/..."
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="border-slate-200"
                required
              />
              <p className="text-sm text-slate-500">
                For testing, any URL starting with https:// will work
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 border-slate-200"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm" className="border-slate-200">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-emerald-100 text-emerald-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-slate-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Pick an expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-slate-500">
                When should this form stop accepting responses?
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/feed')}
                className="flex-1 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isSubmitting ? 'Posting...' : 'Post Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
