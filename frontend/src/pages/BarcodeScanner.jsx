import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScanLine, Search, Loader2, Apple, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const lookupBarcode = async (code) => {
    if (!code || code.length < 4) {
      toast.error('Please enter a valid barcode');
      return;
    }

    setLoading(true);
    setProduct(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutrients = p.nutriments || {};
        setProduct({
          name: p.product_name || 'Unknown Product',
          brand: p.brands || 'Unknown Brand',
          image: p.image_front_small_url || null,
          serving: p.serving_size || 'N/A',
          calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0),
          protein: Math.round(nutrients.proteins_100g || 0),
          carbs: Math.round(nutrients.carbohydrates_100g || 0),
          fat: Math.round(nutrients.fat_100g || 0),
          fiber: Math.round(nutrients.fiber_100g || 0),
          sugar: Math.round(nutrients.sugars_100g || 0),
          sodium: Math.round(nutrients.sodium_100g * 1000 || 0),
          ingredients: p.ingredients_text || 'Not available',
          allergens: p.allergens_tags?.map(a => a.replace('en:', '')).join(', ') || 'None listed',
          nutriscore: p.nutriscore_grade?.toUpperCase() || 'N/A',
          categories: p.categories || 'N/A'
        });
        toast.success('Product found!');
      } else {
        toast.error('Product not found. Try a different barcode.');
      }
    } catch {
      toast.error('Could not look up barcode. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader-hidden');
      const result = await scanner.scanFile(file, true);
      setBarcode(result);
      await scanner.clear();
      lookupBarcode(result);
    } catch {
      toast.error('Could not read barcode from image. Try entering manually.');
    } finally {
      setScanning(false);
    }
  };

  const logToNutrition = async () => {
    if (!product) return;
    setLogging(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          meal_type: 'snack',
          food_items: [product.name],
          calories: product.calories,
          protein_g: product.protein,
          carbs_g: product.carbs,
          fat_g: product.fat,
          notes: `Barcode scan: ${barcode} - ${product.brand}`
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Logged to your nutrition!');
      }
    } catch {
      toast.error('Failed to log nutrition');
    } finally {
      setLogging(false);
    }
  };

  const nutriscoreColor = {
    'A': 'bg-green-500', 'B': 'bg-lime-500', 'C': 'bg-yellow-500', 'D': 'bg-orange-500', 'E': 'bg-red-500'
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center space-y-1">
        <ScanLine className="w-10 h-10 text-emerald-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Barcode Scanner</h1>
        <p className="text-slate-500 text-sm">Scan food products for nutrition info</p>
      </div>

      {/* Scan Options */}
      <Card className="bg-white/90 border-emerald-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode number..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupBarcode(barcode)}
              className="bg-white flex-1"
              data-testid="barcode-input"
            />
            <Button
              onClick={() => lookupBarcode(barcode)}
              disabled={loading || !barcode}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="barcode-search-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-xs mb-2">or scan with camera</p>
            <div id="barcode-reader-hidden" className="hidden" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraScan}
              className="hidden"
              id="barcode-camera"
              data-testid="barcode-camera-input"
            />
            <Button
              onClick={() => document.getElementById('barcode-camera')?.click()}
              disabled={scanning}
              variant="outline"
              className="border-emerald-300 text-emerald-600"
              data-testid="barcode-camera-btn"
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
              ) : (
                <><ScanLine className="w-4 h-4 mr-2" />Scan Barcode Photo</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Result */}
      {product && (
        <Card className="bg-white/90 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <Apple className="w-4 h-4 mr-2 text-emerald-600" />
              {product.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <p className="text-slate-600 text-sm">{product.brand}</p>
                <p className="text-slate-400 text-xs">Serving: {product.serving}</p>
                {product.nutriscore !== 'N/A' && (
                  <span className={`inline-block mt-1 text-white text-xs font-bold px-2 py-0.5 rounded ${nutriscoreColor[product.nutriscore] || 'bg-slate-400'}`}>
                    Nutri-Score: {product.nutriscore}
                  </span>
                )}
              </div>
            </div>

            {/* Nutrition Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Calories', value: `${product.calories} kcal`, color: 'text-orange-600' },
                { label: 'Protein', value: `${product.protein}g`, color: 'text-blue-600' },
                { label: 'Carbs', value: `${product.carbs}g`, color: 'text-amber-600' },
                { label: 'Fat', value: `${product.fat}g`, color: 'text-red-600' },
                { label: 'Fiber', value: `${product.fiber}g`, color: 'text-green-600' },
                { label: 'Sugar', value: `${product.sugar}g`, color: 'text-pink-600' },
              ].map((n, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-slate-400 text-xs">{n.label}</p>
                  <p className={`font-bold text-sm ${n.color}`}>{n.value}</p>
                </div>
              ))}
            </div>

            {product.allergens !== 'None listed' && (
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-red-700 text-xs font-medium">Allergens: {product.allergens}</p>
              </div>
            )}

            {product.ingredients !== 'Not available' && (
              <details className="text-xs">
                <summary className="text-slate-500 cursor-pointer">View Ingredients</summary>
                <p className="text-slate-600 mt-1">{product.ingredients}</p>
              </details>
            )}

            <Button
              onClick={logToNutrition}
              disabled={logging}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="log-scanned-food-btn"
            >
              {logging ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging...</>
              ) : (
                <><Utensils className="w-4 h-4 mr-2" />Log to My Nutrition</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <p className="text-slate-400 text-xs">Powered by Open Food Facts database</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
