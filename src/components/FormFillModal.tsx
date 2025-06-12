
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FormFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
  formUrl: string;
  onFormFilled: () => void;
}

const FormFillModal: React.FC<FormFillModalProps> = ({ 
  isOpen, 
  onClose, 
  formId, 
  formTitle, 
  formUrl,
  onFormFilled 
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started', { user, rating, formId });
    
    if (!user) {
      toast.error('Please log in to fill forms');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting form fill:', { formId, userId: user.id, rating, comment });
      
      const { data, error } = await supabase
        .from('form_fills')
        .insert({
          form_id: formId,
          user_id: user.id,
          rating: rating,
          comment: comment.trim() || null
        })
        .select();

      if (error) {
        console.error('Error saving form fill:', error);
        throw error;
      }

      console.log('Form fill saved successfully:', data);
      toast.success('Thank you for your feedback!');
      onFormFilled();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error: any) {
      console.error('Error submitting form fill:', error);
      toast.error(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForm = () => {
    console.log('Opening form URL:', formUrl);
    
    if (!formUrl) {
      toast.error('Form URL is not available');
      return;
    }
    
    // Ensure the URL has a protocol
    let urlToOpen = formUrl;
    if (!formUrl.startsWith('http://') && !formUrl.startsWith('https://')) {
      urlToOpen = 'https://' + formUrl;
    }
    
    try {
      // Open in new tab
      const newWindow = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        // If popup was blocked, try alternative method
        const link = document.createElement('a');
        link.href = urlToOpen;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('Form opened in new tab');
    } catch (error) {
      console.error('Error opening form:', error);
      toast.error('Failed to open form. Please check the URL.');
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>Fill Form & Rate</DialogTitle>
          <DialogDescription>
            Fill out the form and provide your rating and feedback
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2 text-foreground">{formTitle}</h3>
            <Button
              onClick={openForm}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Form to Fill
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Click above to open and fill the form, then return here to rate it
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 rounded hover:bg-accent transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        value <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  You rated this form {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this form..."
                rows={3}
                className="bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormFillModal;
