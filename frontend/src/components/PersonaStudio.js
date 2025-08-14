import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function PersonaStudio({ user }) {
  const [customPersonas, setCustomPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [newPersona, setNewPersona] = useState({
    name: '',
    role: '',
    system_prompt: '',
    personality_traits: {
      creativity: 5,
      analytical: 5,
      empathy: 5,
      assertiveness: 5,
      risk_tolerance: 5
    },
    voice_settings: {
      voice: 'alloy',
      speed: 1.0,
      speaking_style: 'conversational'
    },
    visual_settings: {
      theme_color: 'purple',
      icon_style: 'modern',
      seating_description: ''
    },
    is_private: true
  });

  const navigate = useNavigate();

  const voiceOptions = [
    { id: 'alloy', name: 'Alloy - Balanced' },
    { id: 'echo', name: 'Echo - Ethereal' },
    { id: 'fable', name: 'Fable - Analytical' },
    { id: 'onyx', name: 'Onyx - Authority' },
    { id: 'nova', name: 'Nova - Energetic' },
    { id: 'shimmer', name: 'Shimmer - Mystical' }
  ];

  const themeColors = [
    { id: 'purple', name: 'Purple', class: 'from-purple-600 to-purple-800' },
    { id: 'blue', name: 'Blue', class: 'from-blue-600 to-blue-800' },
    { id: 'green', name: 'Green', class: 'from-green-600 to-green-800' },
    { id: 'gold', name: 'Gold', class: 'from-yellow-600 to-yellow-800' },
    { id: 'red', name: 'Red', class: 'from-red-600 to-red-800' },
    { id: 'cyan', name: 'Cyan', class: 'from-cyan-600 to-cyan-800' }
  ];

  useEffect(() => {
    if (!user || !['gold', 'vip', 'enterprise'].includes(user.subscription_tier)) {
      navigate('/subscription');
      return;
    }
    fetchCustomPersonas();
  }, [user, navigate]);

  const fetchCustomPersonas = async () => {
    try {
      const response = await axios.get(`${API}/api/personas/customizations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCustomPersonas(response.data.personas || []);
    } catch (error) {
      console.error('Error fetching custom personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePersona = async () => {
    try {
      setIsCreating(true);
      await axios.post(`${API}/api/personas/customizations`, newPersona, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Custom persona created successfully!');
      resetForm();
      fetchCustomPersonas();
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error creating persona:', error);
      alert(error.response?.data?.detail || 'Failed to create persona');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPersona = async () => {
    if (!editingPersona) return;

    try {
      await axios.put(`${API}/api/personas/customizations/${editingPersona.id}`, newPersona, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Persona updated successfully!');
      resetForm();
      fetchCustomPersonas();
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error updating persona:', error);
      alert(error.response?.data?.detail || 'Failed to update persona');
    }
  };

  const startEditing = (persona) => {
    setEditingPersona(persona);
    setNewPersona({
      name: persona.name,
      role: persona.role,
      system_prompt: persona.system_prompt,
      personality_traits: persona.personality_traits,
      voice_settings: persona.voice_settings,
      visual_settings: persona.visual_settings,
      is_private: persona.is_private
    });
    setActiveTab('create');
  };

  const resetForm = () => {
    setEditingPersona(null);
    setNewPersona({
      name: '',
      role: '',
      system_prompt: '',
      personality_traits: {
        creativity: 5,
        analytical: 5,
        empathy: 5,
        assertiveness: 5,
        risk_tolerance: 5
      },
      voice_settings: {
        voice: 'alloy',
        speed: 1.0,
        speaking_style: 'conversational'
      },
      visual_settings: {
        theme_color: 'purple',
        icon_style: 'modern',
        seating_description: ''
      },
      is_private: true
    });
  };

  const updatePersonalityTrait = (trait, value) => {
    setNewPersona(prev => ({
      ...prev,
      personality_traits: {
        ...prev.personality_traits,
        [trait]: parseInt(value)
      }
    }));
  };

  if (!user || !['gold', 'vip', 'enterprise'].includes(user.subscription_tier)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-yellow-400 font-bold mb-2">Premium Feature</h3>
            <p className="text-gray-300 mb-4">Persona Studio requires Gold subscription or higher</p>
            <Button onClick={() => navigate('/subscription')} className="bg-yellow-600 hover:bg-yellow-700">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            🎭 Persona Studio
          </h1>
          <p className="text-gray-300 text-lg">
            Create and customize your own AI parliament members
          </p>
          <Badge className="mt-2 bg-gold-600">
            {user.subscription_tier.toUpperCase()} Feature
          </Badge>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6 justify-center">
          <Button
            onClick={() => setActiveTab('gallery')}
            variant={activeTab === 'gallery' ? 'default' : 'outline'}
            className={activeTab === 'gallery' ? 'bg-purple-600' : 'border-gray-600'}
          >
            🖼️ My Personas
          </Button>
          <Button
            onClick={() => { setActiveTab('create'); resetForm(); }}
            variant={activeTab === 'create' ? 'default' : 'outline'}
            className={activeTab === 'create' ? 'bg-purple-600' : 'border-gray-600'}
          >
            {editingPersona ? '✏️ Edit' : '➕ Create'}
          </Button>
        </div>

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading your personas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customPersonas.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">You haven't created any custom personas yet</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Create Your First Persona
                    </Button>
                  </div>
                ) : (
                  customPersonas.map(persona => (
                    <Card key={persona.id} className={`bg-gradient-to-br ${themeColors.find(c => c.id === persona.visual_settings.theme_color)?.class || 'from-purple-600 to-purple-800'} bg-opacity-20 border-2 border-white/20`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-white">{persona.name}</CardTitle>
                            <Badge className="mt-1 bg-white/20 text-white">{persona.role}</Badge>
                          </div>
                          <div className="text-2xl">🎭</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80 text-sm mb-4 line-clamp-3">
                          {persona.system_prompt.slice(0, 100)}...
                        </p>
                        
                        {/* Personality Traits Preview */}
                        <div className="space-y-2 mb-4">
                          <div className="text-xs text-white/60">Personality Traits:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Creativity: {persona.personality_traits.creativity}/10</div>
                            <div>Analytical: {persona.personality_traits.analytical}/10</div>
                            <div>Empathy: {persona.personality_traits.empathy}/10</div>
                            <div>Assertive: {persona.personality_traits.assertiveness}/10</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                            onClick={() => startEditing(persona)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-white"
                            onClick={() => alert('Add to Parliament feature coming soon!')}
                          >
                            ➕ Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Tab */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle>
                  {editingPersona ? '✏️ Edit Persona' : '➕ Create New Persona'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Name *</label>
                    <Input
                      value={newPersona.name}
                      onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                      placeholder="e.g., The Innovator"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Role *</label>
                    <Input
                      value={newPersona.role}
                      onChange={(e) => setNewPersona({...newPersona, role: e.target.value})}
                      placeholder="e.g., Strategic Visionary"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">System Prompt *</label>
                  <Textarea
                    value={newPersona.system_prompt}
                    onChange={(e) => setNewPersona({...newPersona, system_prompt: e.target.value})}
                    placeholder="Define how this persona thinks, speaks, and behaves..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={4}
                  />
                </div>

                {/* Personality Traits */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">🧠 Personality Traits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(newPersona.personality_traits).map(([trait, value]) => (
                      <div key={trait}>
                        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                          {trait}: {value}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={value}
                          onChange={(e) => updatePersonalityTrait(trait, e.target.value)}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">🎤 Voice Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                      <select
                        value={newPersona.voice_settings.voice}
                        onChange={(e) => setNewPersona({
                          ...newPersona, 
                          voice_settings: {...newPersona.voice_settings, voice: e.target.value}
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        {voiceOptions.map(voice => (
                          <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Speed: {newPersona.voice_settings.speed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={newPersona.voice_settings.speed}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          voice_settings: {...newPersona.voice_settings, speed: parseFloat(e.target.value)}
                        })}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Speaking Style</label>
                      <Input
                        value={newPersona.voice_settings.speaking_style}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          voice_settings: {...newPersona.voice_settings, speaking_style: e.target.value}
                        })}
                        placeholder="e.g., authoritative, gentle, energetic"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">🎨 Visual Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {themeColors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setNewPersona({
                              ...newPersona,
                              visual_settings: {...newPersona.visual_settings, theme_color: color.id}
                            })}
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.class} ${
                              newPersona.visual_settings.theme_color === color.id ? 'ring-2 ring-white' : ''
                            }`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Seating Description</label>
                      <Input
                        value={newPersona.visual_settings.seating_description}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          visual_settings: {...newPersona.visual_settings, seating_description: e.target.value}
                        })}
                        placeholder="e.g., Crystal throne with floating orbs"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private-persona"
                    checked={newPersona.is_private}
                    onChange={(e) => setNewPersona({...newPersona, is_private: e.target.checked})}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="private-persona" className="text-sm font-medium text-gray-300">
                    🔒 Keep this persona private (only you can use it)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-600">
                  <Button
                    onClick={editingPersona ? handleEditPersona : handleCreatePersona}
                    disabled={isCreating || !newPersona.name || !newPersona.role || !newPersona.system_prompt}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isCreating ? 'Saving...' : editingPersona ? '💾 Update Persona' : '🚀 Create Persona'}
                  </Button>
                  <Button
                    onClick={() => { resetForm(); setActiveTab('gallery'); }}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-800"
          >
            ← Back to Parliament
          </Button>
        </div>
      </div>
    </div>
  );
}