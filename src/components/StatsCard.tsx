
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-emerald-500 to-teal-600 text-emerald-600',
    green: 'from-teal-500 to-cyan-600 text-teal-600',
    yellow: 'from-amber-500 to-orange-600 text-amber-600',
    purple: 'from-violet-500 to-purple-600 text-violet-600'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
