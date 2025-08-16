import React from 'react';
import { Badge } from './ui/badge';
import { AlertTriangle, Crown, Users, Zap } from 'lucide-react';

const ConsensusSelector = ({ value, onChange, user }) => {
  const consensusTypes = [
    {
      id: 'majority_50',
      name: '50%+ Majority',
      description: 'Standard voting, 6+ personas agree',
      cost: 'Standard pricing',
      cycles: 1,
      color: 'from-green-500 to-emerald-500',
      tier: 'free'
    },
    {
      id: 'majority_75', 
      name: '3/4 Supermajority',
      description: '75% agreement, 8+ personas agree',
      cost: '50% premium',
      cycles: 2,
      color: 'from-blue-500 to-cyan-500', 
      tier: 'gold'
    },
    {
      id: 'unanimous',
      name: 'Unanimous Consensus',
      description: 'ALL personas must agree (excludes naysayer)',
      cost: '$10-$1000 based on cycles',
      cycles: '2-500 cycles',
      color: 'from-purple-500 to-pink-500',
      tier: 'vip',
      premium: true
    }
  ];

  const canUse = (type) => {
    if (!user) return type.tier === 'free';
    const tierLevels = {free: 0, gold: 1, vip: 2, enterprise: 3};
    const userLevel = tierLevels[user.subscription_tier] || 0;
    const requiredLevel = tierLevels[type.tier] || 0;
    return userLevel >= requiredLevel;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Consensus Requirement
      </label>
      
      <div className="grid gap-3">
        {consensusTypes.map(type => (
          <div
            key={type.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              value === type.id 
                ? `border-purple-500 bg-purple-500/10 shadow-cyber` 
                : canUse(type)
                  ? 'border-gray-600 glass-panel hover:border-purple-500/50'
                  : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
            }`}
            onClick={() => canUse(type) && onChange(type.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-lg bg-gradient-to-r ${type.color} text-white`}>
                  {type.premium ? <Crown className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <h3 className="font-semibold">{type.name}</h3>
                {type.premium && <Zap className="w-4 h-4 text-yellow-400" />}
              </div>
              
              {!canUse(type) && (
                <Badge className="bg-yellow-600/20 border-yellow-500/30 text-yellow-300 text-xs">
                  {type.tier.toUpperCase()} Required
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-300 mb-2">{type.description}</p>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>Cost: {type.cost}</span>
              <span>Cycles: {type.cycles}</span>
            </div>
            
            {type.id === 'unanimous' && (
              <div className="mt-2 p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                <div className="flex items-center gap-1 text-yellow-300 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>High-intensity processing. May require multiple debate rounds.</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsensusSelector;