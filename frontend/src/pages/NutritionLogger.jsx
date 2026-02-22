import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Utensils, TrendingUp, Heart } from 'lucide-react';
import { toast } from 'sonner';

const NutritionLogger = () => {
  const [mealType, setMealType] = useState('breakfast');
  const [foodItems, setFoodItems] = useState([{
    name: '',
    quantity: '',
    unit: 'grams',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: ''
  }]);
  const [notes, setNotes] = useState('');
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch today's meals on load
  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/today`);
      const data = await response.json();
      if (data.success) {
        setTodaysMeals(data.data.meals || []);
        setTodayTotals({
          calories: data.data.totals?.calories || 0,
          protein: data.data.totals?.protein_g || 0,
          carbs: data.data.totals?.carbs_g || 0,
          fat: data.data.totals?.fat_g || 0
        });
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, {
      name: '',
      quantity: '',
      unit: 'grams',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fat_g: '',
      fiber_g: ''
    }]);
  };

  const removeFoodItem = (index) => {
    const newItems = foodItems.filter((_, i) => i !== index);
    setFoodItems(newItems.length > 0 ? newItems : [{
      name: '',
      quantity: '',
      unit: 'grams',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fat_g: '',
      fiber_g: ''
    }]);
  };

  const updateFoodItem = (index, field, value) => {
    const newItems = [...foodItems];
    newItems[index][field] = value;
    setFoodItems(newItems);
  };

  const handleSubmit = async () => {
    // Validate
    const validItems = foodItems.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setLoading(true);
    try {
      const mealData = {
        meal_type: mealType,
        food_items: validItems.map(item => ({
          name: item.name,
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit,
          calories: parseFloat(item.calories) || 0,
          protein_g: parseFloat(item.protein_g) || 0,
          carbs_g: parseFloat(item.carbs_g) || 0,
          fat_g: parseFloat(item.fat_g) || 0,
          fiber_g: parseFloat(item.fiber_g) || 0
        })),
        meal_time: new Date().toISOString(),
        notes: notes || null
      };

      const response = await fetch(`${BACKEND_URL}/api/nutrition/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} logged successfully!`);
        
        // Reset form
        setFoodItems([{
          name: '',
          quantity: '',
          unit: 'grams',
          calories: '',
          protein_g: '',
          carbs_g: '',
          fat_g: '',
          fiber_g: ''
        }]);
        setNotes('');
        
        // Refresh today's meals
        fetchTodaysMeals();
      } else {
        toast.error('Failed to log meal');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error('Error logging meal');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-red-500';
  };

  const targets = {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4" data-testid="nutrition-logger">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Utensils className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Nutrition Tracker</h1>
              <p className="text-gray-400 text-sm">Built with purpose for families everywhere</p>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Today's Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Calories</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(todayTotals.calories)}
                  <span className="text-sm text-gray-500"> / {targets.calories}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(todayTotals.calories, targets.calories)}`}
                    style={{width: `${Math.min((todayTotals.calories / targets.calories) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs mb-1">Protein</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(todayTotals.protein)}g
                  <span className="text-sm text-gray-500"> / {targets.protein}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(todayTotals.protein, targets.protein)}`}
                    style={{width: `${Math.min((todayTotals.protein / targets.protein) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs mb-1">Carbs</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(todayTotals.carbs)}g
                  <span className="text-sm text-gray-500"> / {targets.carbs}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(todayTotals.carbs, targets.carbs)}`}
                    style={{width: `${Math.min((todayTotals.carbs / targets.carbs) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs mb-1">Fat</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(todayTotals.fat)}g
                  <span className="text-sm text-gray-500"> / {targets.fat}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(todayTotals.fat, targets.fat)}`}
                    style={{width: `${Math.min((todayTotals.fat / targets.fat) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {todayTotals.calories === 0 && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Start tracking your meals to see your progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Meal Form */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Log a Meal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meal Type */}
            <div className="space-y-2">
              <Label htmlFor="meal-type" className="text-gray-300">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Food Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Food Items</Label>
                <Button
                  type="button"
                  onClick={addFoodItem}
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {foodItems.map((item, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-gray-400 text-xs">Food Name *</Label>
                            <Input
                              placeholder="e.g., Chicken Breast"
                              value={item.name}
                              onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-gray-400 text-xs">Quantity</Label>
                              <Input
                                type="number"
                                placeholder="150"
                                value={item.quantity}
                                onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                                className="bg-gray-900 border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Unit</Label>
                              <Select value={item.unit} onValueChange={(value) => updateFoodItem(index, 'unit', value)}>
                                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grams">grams</SelectItem>
                                  <SelectItem value="oz">oz</SelectItem>
                                  <SelectItem value="cups">cups</SelectItem>
                                  <SelectItem value="pieces">pieces</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div>
                            <Label className="text-gray-400 text-xs">Calories</Label>
                            <Input
                              type="number"
                              placeholder="165"
                              value={item.calories}
                              onChange={(e) => updateFoodItem(index, 'calories', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Protein (g)</Label>
                            <Input
                              type="number"
                              placeholder="31"
                              value={item.protein_g}
                              onChange={(e) => updateFoodItem(index, 'protein_g', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Carbs (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.carbs_g}
                              onChange={(e) => updateFoodItem(index, 'carbs_g', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Fat (g)</Label>
                            <Input
                              type="number"
                              placeholder="3.6"
                              value={item.fat_g}
                              onChange={(e) => updateFoodItem(index, 'fat_g', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Fiber (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.fiber_g}
                              onChange={(e) => updateFoodItem(index, 'fiber_g', e.target.value)}
                              className="bg-gray-900 border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {foodItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did you feel after this meal? Any observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
              data-testid="log-meal-button"
            >
              {loading ? 'Logging Meal...' : `Log ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
            </Button>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        {todaysMeals.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Today's Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysMeals.map((meal, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {meal.meal_type === 'breakfast' && '🌅'}
                          {meal.meal_type === 'lunch' && '☀️'}
                          {meal.meal_type === 'dinner' && '🌙'}
                          {meal.meal_type === 'snack' && '🍎'}
                        </span>
                        <span className="text-white font-semibold capitalize">{meal.meal_type}</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(meal.meal_time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      {meal.food_items.map((food, idx) => (
                        <div key={idx} className="text-gray-300 text-sm">
                          • {food.name} ({food.quantity}{food.unit})
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="text-green-400">{Math.round(meal.total_calories)} cal</span>
                      <span className="text-blue-400">{Math.round(meal.total_protein_g)}g protein</span>
                      <span className="text-yellow-400">{Math.round(meal.total_carbs_g)}g carbs</span>
                      <span className="text-orange-400">{Math.round(meal.total_fat_g)}g fat</span>
                    </div>

                    {meal.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-gray-400 text-sm italic">{meal.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        <div className="text-center">
          <p className="text-gray-500 text-sm italic">
            "Fix it, Run it, Again - Until Wellness Wins" 💚
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Built for families everywhere
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionLogger;
