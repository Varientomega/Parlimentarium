import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Filter, Plus, ArrowLeft, ShoppingCart, Star, 
  TrendingUp, Zap, Crown, Settings, Eye, Package,
  Sparkles, Globe, Users, DollarSign
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function MarketplacePage({ user }) {
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [categories, setCategories] = useState([
    { id: 'persona', name: '🎭 Custom Personas', description: 'Unique AI personalities', min_price: 10.0 },
    { id: 'template', name: '📋 Discussion Templates', description: 'Pre-made meeting structures', min_price: 5.0 },
    { id: 'workflow', name: '⚙️ Custom Workflows', description: 'Specialized deliberation processes', min_price: 15.0 },
    { id: 'install_new_government', name: '🏛️ Install New Government', description: 'Complete governance transformation packages', min_price: 25.0, max_price: 500.0 }
  ]);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'persona',
    price: 10.0, // Updated default to meet persona minimum
    content: {}
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketplaceItems();
    if (user && ['gold', 'vip', 'enterprise'].includes(user.subscription_tier)) {
      fetchMyItems();
    }
  }, [user]);

  const fetchMarketplaceItems = async () => {
    try {
      const config = user ? {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      } : {};

      const response = await axios.get(`${API}/api/marketplace/items`, config);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const response = await axios.get(`${API}/api/marketplace/my-items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleCreateItem = async () => {
    if (!user || !['gold', 'vip', 'enterprise'].includes(user.subscription_tier)) {
      alert('Gold subscription or higher required to create marketplace items');
      navigate('/subscription');
      return;
    }

    try {
      setIsCreating(true);
      await axios.post(`${API}/api/marketplace/items`, newItem, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Item created successfully!');
      const defaultPrices = { persona: 10.0, template: 5.0, workflow: 15.0, install_new_government: 25.0 };
      setNewItem({ 
        title: '', 
        description: '', 
        category: 'persona', 
        price: defaultPrices.persona, 
        content: {} 
      });
      fetchMyItems();
      setActiveTab('my-items');
    } catch (error) {
      console.error('Error creating item:', error);
      alert(error.response?.data?.detail || 'Failed to create item');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canCreateItems = user && ['gold', 'vip', 'enterprise'].includes(user.subscription_tier);

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'persona': return '🎭';
      case 'template': return '📋';
      case 'workflow': return '⚙️';
      case 'install_new_government': return '🏛️';
      default: return '📦';
    }
  };

  const getCategoryColor = (categoryId) => {
    switch (categoryId) {
      case 'persona': return 'from-purple-500 to-pink-500';
      case 'template': return 'from-blue-500 to-cyan-500';
      case 'workflow': return 'from-green-500 to-emerald-500';
      case 'install_new_government': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl glass-panel">
              <ShoppingCart className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-5xl font-display heading-display">
              AI Parliament Marketplace
            </h1>
            <div className="p-3 rounded-2xl glass-panel">
              <Sparkles className="w-8 h-8 text-neon-blue" />
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto text-balance">
            Discover, create, and trade custom AI personas, workflows, and governance systems
          </p>

          {!canCreateItems && (
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full border border-yellow-500/30">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm">Upgrade to Gold+ to create and sell items</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel rounded-2xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'browse' 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-cyber' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4" />
              Browse Marketplace
            </button>
            {canCreateItems && (
              <>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'create' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-cyber' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Create Item
                </button>
                <button
                  onClick={() => setActiveTab('my-items')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'my-items' 
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-cyber' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  My Items
                </button>
              </>
            )}
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search personas, templates, workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cyber-input pl-10 h-12"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="cyber-input pl-10 pr-8 h-12 min-w-48 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Grid */}
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-3 glass-panel px-6 py-4 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">Loading marketplace...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <div className="glass-panel rounded-3xl p-12 max-w-md mx-auto">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No items found</h3>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <Card 
                      key={item.id} 
                      className="cyber-card group hover-lift animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-r ${getCategoryColor(item.category)} text-white shadow-neon`}>
                              <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                              <Badge className={`text-xs bg-gradient-to-r ${getCategoryColor(item.category)} text-white border-0`}>
                                {categories.find(c => c.id === item.category)?.name?.split(' ')[1] || item.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{item.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-xl font-bold text-green-400">${item.price}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{item.sales_count || 0} sales</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{item.views || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-cyber hover-lift"
                          onClick={() => alert('Purchase functionality coming soon!')}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && canCreateItems && (
          <div className="max-w-2xl mx-auto">
            <Card className="cyber-card border-2 border-green-500/20 shadow-cyber">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-display flex items-center justify-center gap-3">
                  <Plus className="w-6 h-6 text-green-400" />
                  Create New Marketplace Item
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </CardTitle>
                <p className="text-muted-foreground">Share your AI creations with the community</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Item Title
                  </label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="Enter a compelling title for your item"
                    className="cyber-input h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      const category = categories.find(c => c.id === selectedCategory);
                      const minPrice = category ? category.min_price : 5.0;
                      setNewItem({...newItem, category: selectedCategory, price: Math.max(newItem.price, minPrice)});
                    }}
                    className="w-full cyber-input h-12 appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Description
                  </label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe your item's features, benefits, and use cases..."
                    className="cyber-input resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-300 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price (USD)
                      </div>
                      {(() => {
                        const category = categories.find(c => c.id === newItem.category);
                        if (category) {
                          const minText = `Min: $${category.min_price}`;
                          const maxText = category.max_price ? ` • Max: $${category.max_price}` : '';
                          return <span className="text-xs text-gray-400">({minText}{maxText})</span>;
                        }
                        return null;
                      })()}
                    </div>
                  </label>
                  <Input
                    type="number"
                    min={categories.find(c => c.id === newItem.category)?.min_price || 1}
                    max={categories.find(c => c.id === newItem.category)?.max_price || undefined}
                    step="0.50"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    className="cyber-input h-12"
                  />
                </div>

                <Button
                  onClick={handleCreateItem}
                  disabled={isCreating || !newItem.title || !newItem.description}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-cyber hover-lift"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Item...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Create & Publish Item
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Items Tab */}
        {activeTab === 'my-items' && canCreateItems && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="glass-panel rounded-3xl p-12 max-w-md mx-auto">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No items created yet</h3>
                    <p className="text-gray-400 mb-6">Start creating and selling your AI innovations</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-cyber"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Item
                    </Button>
                  </div>
                </div>
              ) : (
                myItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="cyber-card border-2 border-green-500/20 hover-lift animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${getCategoryColor(item.category)} text-white`}>
                            <span className="text-lg">{getCategoryIcon(item.category)}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                            <Badge className={item.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      
                      <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-lg font-bold text-green-400">${item.price}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{item.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{item.sales_count || 0} sales</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-16">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="glass-button border-purple-500/30 text-purple-300 hover:border-purple-500 px-8 py-3 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Parliament
          </Button>
        </div>
      </div>
    </div>
  );
}