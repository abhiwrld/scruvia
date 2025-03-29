import React from 'react';

interface CounterProps {
  user: any;
}

const Counter: React.FC<CounterProps> = ({ user }) => {
  if (!user) return null;
  
  const plan = user.plan || 'free';
  const questionsUsed = user.questions_used || 0;
  
  let limit = 10; // Default for free plan
  if (plan === 'plus') limit = 50;
  if (plan === 'pro') limit = 200;
  if (plan === 'team') limit = 500;
  
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {questionsUsed}/{limit} questions
    </div>
  );
};

export default Counter; 