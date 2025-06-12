
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmailConfirmed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Email Confirmed Successfully!
          </CardTitle>
          <CardDescription className="text-lg">
            ✅ Your profile has been successfully created! Welcome aboard!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-700 font-medium">
              🎉 Your SurvEase account is now active!
            </p>
            <p className="text-green-600 text-sm mt-2">
              You can now log in and start sharing or filling forms.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Login
            </Button>
            
            <p className="text-sm text-gray-500">
              You will be automatically redirected in 5 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
