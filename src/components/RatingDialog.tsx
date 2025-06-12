
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formId: string;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ isOpen, onClose, formTitle, formId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Thank you for your rating!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this form</DialogTitle>
          <DialogDescription>
            How was your experience with "{formTitle}"?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this form..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
