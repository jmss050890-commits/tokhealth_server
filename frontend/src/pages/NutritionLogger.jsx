import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Utensils, TrendingUp, Heart, Camera, Upload, Sparkles, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

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
  
  // Photo analysis states
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/today`, {
        headers: getAuthHeaders()
      });
          carbs: data.data.totals?.carbs_g || 0,
          fat: data.data.totals?.fat_g || 0
        });
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  // Photo handling
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!photoPreview) return;
    
    setAnalyzing(true);
    try {
      // Extract base64 data (remove the data:image/...;base64, prefix)
      const base64Data = photoPreview.split(',')[1];
      
      const response = await fetch(`${BACKEND_URL}/api/nutrition/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64Data,
          meal_type: mealType
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        
        // Auto-populate food items from analysis
        if (data.data.foods && data.data.foods.length > 0) {
          const newFoodItems = data.data.foods.map(food => ({
            name: food.name,
            quantity: food.quantity?.toString() || '1',
            unit: food.unit || 'serving',
            calories: food.calories?.toString() || '',
            protein_g: food.protein_g?.toString() || '',
            carbs_g: food.carbs_g?.toString() || '',
            fat_g: food.fat_g?.toString() || '',
            fiber_g: food.fiber_g?.toString() || ''
          }));
          setFoodItems(newFoodItems);
          toast.success(`Found ${data.data.foods.length} food item(s)!`);
        }
        
        // Add health notes to notes field
        if (data.data.health_notes) {
          setNotes(data.data.health_notes);
        }
      } else {
        toast.error('Could not analyze the photo');
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast.error('Failed to analyze photo');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        clearPhoto();
        
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
    if (percentage <= 110) return 'bg-emerald-500';
    return 'bg-red-500';
  };

  const targets = {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65
  };

  return (
    <div className="p-4" data-testid="nutrition-logger">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nutrition Tracker</h1>
            <p className="text-slate-500 text-sm">Log meals manually or snap a photo</p>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-sky-600" />
              Today's Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Calories</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(todayTotals.calories)}</div>
                <div className="text-xs text-slate-400">/ {targets.calories}</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(todayTotals.calories, targets.calories)}`}
                    style={{width: `${Math.min((todayTotals.calories / targets.calories) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Protein</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(todayTotals.protein)}g</div>
                <div className="text-xs text-slate-400">/ {targets.protein}g</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(todayTotals.protein, targets.protein)}`}
                    style={{width: `${Math.min((todayTotals.protein / targets.protein) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Carbs</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(todayTotals.carbs)}g</div>
                <div className="text-xs text-slate-400">/ {targets.carbs}g</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(todayTotals.carbs, targets.carbs)}`}
                    style={{width: `${Math.min((todayTotals.carbs / targets.carbs) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Fat</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(todayTotals.fat)}g</div>
                <div className="text-xs text-slate-400">/ {targets.fat}g</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(todayTotals.fat, targets.fat)}`}
                    style={{width: `${Math.min((todayTotals.fat / targets.fat) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Capture Section */}
        <Card className="bg-gradient-to-r from-violet-50 to-sky-50 border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <Camera className="w-4 h-4 mr-2 text-violet-600" />
              AI Meal Recognition
              <Sparkles className="w-4 h-4 ml-2 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!photoPreview ? (
              <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-violet-300 rounded-lg bg-white/50">
                <Camera className="w-12 h-12 text-violet-400 mb-3" />
                <p className="text-slate-600 text-sm mb-3">Take a photo of your meal</p>
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-input"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    data-testid="capture-photo-btn"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handlePhotoSelect(e);
                      input.click();
                    }}
                    variant="outline"
                    className="border-violet-300 text-violet-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Photo Preview */}
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Meal preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    onClick={clearPhoto}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Analyze Button */}
                {!analysisResult && (
                  <Button
                    onClick={analyzePhoto}
                    disabled={analyzing}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                    data-testid="analyze-photo-btn"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Meal
                      </>
                    )}
                  </Button>
                )}

                {/* Analysis Result */}
                {analysisResult && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-800 text-sm">AI Analysis Complete</span>
                    </div>
                    <p className="text-slate-600 text-sm">{analysisResult.meal_description}</p>
                    <p className="text-emerald-700 text-sm font-medium mt-1">
                      Total: ~{analysisResult.total_calories} calories
                    </p>
                    <p className="text-slate-500 text-xs mt-2 italic">
                      Food items auto-filled below. Adjust if needed!
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Meal Form */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm">Log Meal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Meal Type */}
            <div className="space-y-1">
              <Label className="text-slate-600 text-sm">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Food Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-600 text-sm">Food Items</Label>
                <Button
                  type="button"
                  onClick={addFoodItem}
                  variant="outline"
                  size="sm"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {foodItems.map((item, index) => (
                <Card key={index} className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-slate-500 text-xs">Food Name *</Label>
                            <Input
                              placeholder="e.g., Chicken"
                              value={item.name}
                              onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <Label className="text-slate-500 text-xs">Qty</Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={item.quantity}
                                onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                                className="bg-white border-slate-200 text-slate-800 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-500 text-xs">Unit</Label>
                              <Select value={item.unit} onValueChange={(value) => updateFoodItem(index, 'unit', value)}>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-800 text-sm h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grams">g</SelectItem>
                                  <SelectItem value="oz">oz</SelectItem>
                                  <SelectItem value="cups">cup</SelectItem>
                                  <SelectItem value="serving">srv</SelectItem>
                                  <SelectItem value="pieces">pcs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-1">
                          <div>
                            <Label className="text-slate-500 text-xs">Cal</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.calories}
                              onChange={(e) => updateFoodItem(index, 'calories', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs">Prot</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.protein_g}
                              onChange={(e) => updateFoodItem(index, 'protein_g', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs">Carb</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.carbs_g}
                              onChange={(e) => updateFoodItem(index, 'carbs_g', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs">Fat</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.fat_g}
                              onChange={(e) => updateFoodItem(index, 'fat_g', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs">Fib</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.fiber_g}
                              onChange={(e) => updateFoodItem(index, 'fiber_g', e.target.value)}
                              className="bg-white border-slate-200 text-slate-800 text-sm"
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
                          className="text-red-500 hover:bg-red-50 h-8 w-8"
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
            <div className="space-y-1">
              <Label className="text-slate-600 text-sm">Notes (Optional)</Label>
              <Textarea
                placeholder="How did you feel after this meal?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white border-slate-200 text-slate-800 min-h-[60px] text-sm"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5"
              data-testid="log-meal-button"
            >
              {loading ? 'Logging...' : `Log ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
            </Button>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        {todaysMeals.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Today's Meals ({todaysMeals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaysMeals.map((meal, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-800 font-medium text-sm capitalize">{meal.meal_type}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(meal.meal_time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                    
                    <div className="space-y-0.5 mb-2">
                      {meal.food_items.slice(0, 2).map((food, idx) => (
                        <div key={idx} className="text-slate-600 text-xs">
                          {food.name} ({food.quantity}{food.unit})
                        </div>
                      ))}
                      {meal.food_items.length > 2 && (
                        <div className="text-slate-400 text-xs">+{meal.food_items.length - 2} more</div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-emerald-600">{Math.round(meal.total_calories)} cal</span>
                      <span className="text-sky-600">{Math.round(meal.total_protein_g)}g P</span>
                      <span className="text-amber-600">{Math.round(meal.total_carbs_g)}g C</span>
                      <span className="text-orange-600">{Math.round(meal.total_fat_g)}g F</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - Track What Fuels You
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionLogger;
