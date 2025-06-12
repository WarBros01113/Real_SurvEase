
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, MessageCircle, ExternalLink } from 'lucide-react';
import FormFillModal from './FormFillModal';

interface FormCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  expireAt: string | null;
  googleFormUrl: string;
  fillCount: number;
  averageRating: number;
  onFormFilled?: () => void;
}

const FormCard: React.FC<FormCardProps> = ({
  id,
  title,
  description,
  tags,
  createdAt,
  expireAt,
  googleFormUrl,
  fillCount,
  averageRating,
  onFormFilled
}) => {
  const [showFillModal, setShowFillModal] = useState(false);

  const isExpired = expireAt ? new Date(expireAt) < new Date() : false;

  const handleFillForm = () => {
    setShowFillModal(true);
  };

  const handleFormFilled = () => {
    if (onFormFilled) {
      onFormFilled();
    }
  };

  return (
    <>
      <Card className={`border-slate-200 hover:shadow-md transition-shadow ${isExpired ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
            {isExpired && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{fillCount} responses</span>
              </div>
              {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)} rating</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(createdAt).toLocaleDateString()}</span>
              </div>
              {expireAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className={isExpired ? 'text-red-600' : ''}>
                    Expires {new Date(expireAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleFillForm}
                disabled={isExpired}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Fill & Rate Form
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(googleFormUrl, '_blank')}
                className="px-3"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormFillModal
        isOpen={showFillModal}
        onClose={() => setShowFillModal(false)}
        formId={id}
        formTitle={title}
        formUrl={googleFormUrl}
        onFormFilled={handleFormFilled}
      />
    </>
  );
};

export default FormCard;
