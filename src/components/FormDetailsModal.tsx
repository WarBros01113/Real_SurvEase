
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, User, ExternalLink } from 'lucide-react';

interface FormDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFillForm: () => void;
  form: {
    id: string;
    title: string;
    description: string;
    creator: string;
    tags: string[];
    createdAt: string;
    expiresAt: string | null;
    ratings: number;
    totalRatings: number;
    formUrl: string;
  };
}

const FormDetailsModal: React.FC<FormDetailsModalProps> = ({
  isOpen,
  onClose,
  onFillForm,
  form
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-600">
            {form.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            Form Details & Information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Form Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {form.description || 'No description provided for this form.'}
            </p>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">Created by:</span>
            <span className="font-medium">{form.creator}</span>
          </div>

          {/* Tags */}
          {form.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Rating</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {form.ratings > 0 ? form.ratings.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-blue-700">
                {form.totalRatings} {form.totalRatings === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Created</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">
                {new Date(form.createdAt).toLocaleDateString()}
              </div>
              {form.expiresAt && (
                <div className="text-sm text-emerald-700">
                  Expires: {new Date(form.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📝 Before You Fill This Form:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure you have all the necessary information ready</li>
              <li>• You'll be redirected to the original Google Form</li>
              <li>• After completing, you can rate and comment on this form</li>
              <li>• Your response will be recorded in your activity</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onFillForm}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Fill This Form
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailsModal;
