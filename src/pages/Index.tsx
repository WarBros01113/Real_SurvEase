
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Users, BarChart3, Award, QrCode } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Share Google Forms",
      description: "Post your Google Forms with metadata and reach a wider audience"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Community Driven",
      description: "Fill forms from other users and help build a collaborative community"
    },
    {
      icon: <Award className="w-8 h-8 text-green-600" />,
      title: "Gamification",
      description: "Earn badges, climb leaderboards, and get recognized for your contributions"
    },
    {
      icon: <QrCode className="w-8 h-8 text-orange-600" />,
      title: "QR Code Sharing",
      description: "Generate QR codes for easy form sharing across platforms"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Welcome to SurvEase
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate platform for sharing and discovering Google Forms. 
            Connect with a community of survey creators and participants.
          </p>
          {user ? (
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/feed">
                <Button size="lg" variant="outline">
                  Browse Forms
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SurvEase?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Join Our Growing Community</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-blue-100">Forms Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Forms Completed</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
