import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Coffee, Sparkles, X } from 'lucide-react';

const SupportTokHealth = ({ onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const amounts = [
    { value: 5, label: '$5', description: 'A coffee' },
    { value: 10, label: '$10', description: 'A meal' },
    { value: 25, label: '$25', description: 'A blessing' },
  ];

  const handleSupport = (amount) => {
    if (!amount) return;
    
    // Open PayPal.me with the selected amount
    window.open(`https://paypal.me/TokHealthKPA/${amount}`, '_blank');
    
    // Show thank you message
    setShowThankYou(true);
  };

  if (showThankYou) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-amber-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">Thank You!</h3>
          <p className="text-slate-600 text-sm mb-4">
            Your generosity helps us continue the mission to Keep People Alive.
          </p>
          <p className="text-purple-600 text-sm italic">
            "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
          </p>
          <Button 
            onClick={onClose} 
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Continue to TokHealth
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-800 text-lg flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Support Our Mission
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm">
          TokHealth is free for everyone. If it's made a difference in your life and you'd like to help us reach more people, your support means the world.
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {amounts.map((amount) => (
            <Button
              key={amount.value}
              variant={selectedAmount === amount.value ? 'default' : 'outline'}
              onClick={() => setSelectedAmount(amount.value)}
              className={`flex flex-col h-auto py-3 ${
                selectedAmount === amount.value 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-purple-200 hover:border-purple-400'
              }`}
            >
              <span className="text-lg font-bold">{amount.label}</span>
              <span className="text-xs opacity-80">{amount.description}</span>
            </Button>
          ))}
        </div>

        <Button 
          onClick={() => handleSupport(selectedAmount)}
          disabled={!selectedAmount}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
        >
          <Heart className="w-4 h-4 mr-2" />
          Support TokHealth
        </Button>

        <p className="text-center text-xs text-slate-400">
          100% goes toward keeping TokHealth free and reaching more families
        </p>
      </CardContent>
    </Card>
  );
};

export default SupportTokHealth;
