import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function MarketplacePage({ user }) {
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'persona',
    price: 10.0, // Updated default to meet persona minimum
    content: {}
  });

  const navigate = useNavigate();

  const [categories, setCategories] = useState([
    { id: 'persona', name: '🎭 Custom Personas', description: 'Unique AI personalities', min_price: 10.0 },
    { id: 'template', name: '📋 Discussion Templates', description: 'Pre-made meeting structures', min_price: 5.0 },
    { id: 'workflow', name: '⚙️ Custom Workflows', description: 'Specialized deliberation processes', min_price: 15.0 },
    { id: 'install_new_government', name: '🏛️ Install New Government', description: 'Complete governance transformation packages', min_price: 25.0, max_price: 500.0 }
  ]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            🛒 AI Parliament Marketplace
          </h1>
          <p className="text-gray-300 text-lg">
            Discover, create, and trade custom AI personas and workflows
          </p>
          {!canCreateItems && (
            <div className="mt-4">
              <Badge className="bg-yellow-600 text-white">
                Upgrade to Gold+ to create and sell items
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6 justify-center">
          <Button
            onClick={() => setActiveTab('browse')}
            variant={activeTab === 'browse' ? 'default' : 'outline'}
            className={activeTab === 'browse' ? 'bg-purple-600' : 'border-gray-600'}
          >
            🛒 Browse
          </Button>
          {canCreateItems && (
            <>
              <Button
                onClick={() => setActiveTab('create')}
                variant={activeTab === 'create' ? 'default' : 'outline'}
                className={activeTab === 'create' ? 'bg-purple-600' : 'border-gray-600'}
              >
                ➕ Create
              </Button>
              <Button
                onClick={() => setActiveTab('my-items')}
                variant={activeTab === 'my-items' ? 'default' : 'outline'}
                className={activeTab === 'my-items' ? 'bg-purple-600' : 'border-gray-600'}
              >
                📦 My Items
              </Button>
            </>
          )}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Items Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading marketplace...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No items found</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <Card key={item.id} className="bg-gray-800/50 border-gray-600 hover:border-purple-500/50 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge className={`${item.category === 'persona' ? 'bg-purple-600' : item.category === 'template' ? 'bg-blue-600' : 'bg-green-600'}`}>
                            {categories.find(c => c.id === item.category)?.name?.split(' ')[0] || item.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-green-400 font-bold">${item.price}</div>
                          <div className="text-xs text-gray-500">
                            ⭐ {item.rating?.toFixed(1) || '0.0'} • {item.sales_count} sales
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                          onClick={() => alert('Purchase functionality coming soon!')}
                        >
                          🛒 Purchase
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
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle>➕ Create New Marketplace Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="Enter item title"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      const category = categories.find(c => c.id === selectedCategory);
                      const minPrice = category ? category.min_price : 5.0;
                      setNewItem({...newItem, category: selectedCategory, price: Math.max(newItem.price, minPrice)});
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe your item..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Price ($)</label>
                  <Input
                    type="number"
                    min="1"
                    step="0.50"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleCreateItem}
                  disabled={isCreating || !newItem.title || !newItem.description}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? 'Creating...' : '🚀 Create Item'}
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
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">You haven't created any items yet</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                  >
                    Create Your First Item
                  </Button>
                </div>
              ) : (
                myItems.map(item => (
                  <Card key={item.id} className="bg-gray-800/50 border-green-500/30">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge className={item.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-green-400 font-bold">${item.price}</div>
                        <div className="text-xs text-gray-500">
                          ⭐ {item.rating?.toFixed(1) || '0.0'} • {item.sales_count} sales
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          📝 Edit
                        </Button>
                        <Button size="sm" className="flex-1 bg-gray-600 hover:bg-gray-700">
                          📊 Stats
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