import Item from '../models/item.model.js'; // ✅ Updated path

// AI Helper class
class AIHelper {
  constructor() {
    this.foodCategories = {
      indian: ['biryani', 'curry', 'dal', 'tandoori', 'masala', 'paneer', 'roti', 'naan'],
      northIndian: ['chole bhature', 'rajma', 'butter chicken', 'dal makhani', 'paratha'],
      southIndian: ['dosa', 'idli', 'vada', 'uttapam', 'sambar', 'upma'],
      chinese: ['noodles', 'fried rice', 'manchurian', 'chowmein', 'momos'],
      italian: ['pizza', 'pasta', 'lasagna', 'spaghetti'],
      fastFood: ['burger', 'sandwich', 'hot dog', 'fries', 'nuggets'],
      desserts: ['ice cream', 'cake', 'pastry', 'brownie', 'cookie'],
      beverages: ['shake', 'juice', 'coffee', 'tea', 'smoothie']
    };
  }

  extractKeywords(query) {
    const cleanQuery = query.toLowerCase().trim();
    const words = cleanQuery.split(/\s+/);
    const stopWords = ['best', 'good', 'near', 'me', 'my', 'location', 'find', 'show', 'get', 'i', 'want', 'need'];
    return words.filter(word => word.length > 2 && !stopWords.includes(word));
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateRelevanceScore(item, keywords, userLocation) {
    let score = 0;
    const itemName = item.name?.toLowerCase() || ''; // ✅ Changed from itemName to name
    const category = item.category?.toLowerCase() || '';
    const shopName = item.shop?.name?.toLowerCase() || ''; // ✅ Changed from shopId to shop

    keywords.forEach(keyword => {
      if (itemName === keyword) score += 10;
      else if (itemName.includes(keyword)) score += 5;
      if (category.includes(keyword)) score += 3;
      if (shopName.includes(keyword)) score += 2;
    });

    for (const [catName, catKeywords] of Object.entries(this.foodCategories)) {
      const matchCount = keywords.filter(kw => catKeywords.includes(kw)).length;
      if (matchCount > 0) score += matchCount * 2;
    }

    if (userLocation && item.shop?.location) { // ✅ Changed from shopId to shop
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        item.shop.location.lat,
        item.shop.location.lng
      );
      if (distance < 1) score += 5;
      else if (distance < 3) score += 3;
      else if (distance < 5) score += 1;
    }

    if (item.rating?.average) score += item.rating.average; // ✅ Updated rating structure
    return score;
  }

  searchFood(query, items, userLocation) {
    const keywords = this.extractKeywords(query);
    
    if (keywords.length === 0) {
      return {
        success: false,
        message: "Please provide more specific search terms",
        results: []
      };
    }

    const scoredItems = items
      .filter(item => item.shop) // ✅ Changed from shopId to shop
      .map(item => ({
        ...item,
        relevanceScore: this.calculateRelevanceScore(item, keywords, userLocation)
      }))
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const shopResults = {};
    scoredItems.forEach(item => {
      const shopId = item.shop._id.toString(); // ✅ Changed from shopId to shop
      if (!shopResults[shopId]) {
        shopResults[shopId] = {
          shop: item.shop, // ✅ Changed from shopId to shop
          items: [],
          totalScore: 0
        };
      }
      shopResults[shopId].items.push(item);
      shopResults[shopId].totalScore += item.relevanceScore;
    });

    const results = Object.values(shopResults)
      .map(result => ({
        ...result,
        avgScore: result.totalScore / result.items.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
// ✅ If no matches, return ALL shops with their items
if (results.length === 0) {
  const allShops = {};
  items.forEach(item => {
    const shopId = item.shop._id.toString();
    if (!allShops[shopId]) {
      allShops[shopId] = {
        shop: item.shop,
        items: [],
        avgScore: 0
      };
    }
    allShops[shopId].items.push(item);
  });

  const allResults = Object.values(allShops).slice(0, 3);

  return {
    success: true,
    query,
    keywords,
    text: `I couldn't find exact matches for "${query}", but here are some shops you might like:`,
    resultsCount: allResults.length,
    results: allResults.map(r => ({
      shop: {
        _id: r.shop._id,
        name: r.shop.name,
        address: r.shop.address,
        rating: r.shop.rating,
        location: r.shop.location
      },
      items: r.items.slice(0, 5).map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
        rating: item.rating,
        foodType: item.foodType
      })),
      matchScore: "0"
    }))
  };
}

const text = `Great choice! I found ${results.length} shop(s) serving what you're looking for.`;

return {
  success: true,
  query,
  keywords,
  text,
  resultsCount: results.length,
  results: results.map(r => ({
    shop: {
      _id: r.shop._id,
      name: r.shop.name,
      address: r.shop.address,
      rating: r.shop.rating,
      location: r.shop.location
    },
    items: r.items.slice(0, 5).map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      rating: item.rating,
      foodType: item.foodType,
      relevanceScore: item.relevanceScore
    })),
    matchScore: r.avgScore.toFixed(2)
  }))
};

}
}

const aiHelper = new AIHelper();

// AI Chat Controller
export const chatAI = async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid search query"
      });
    }

    const userCity = req.user?.city || location?.city;

    const items = await Item.find({
      ...(userCity && { city: userCity })
    })
      .populate('shop', 'name address rating location city') // ✅ Changed from shopId to shop
      .lean();

    if (items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No items available in your area yet. Please check back later!",
        results: []
      });
    }

    const aiResponse = aiHelper.searchFood(query, items, location);
    return res.status(200).json(aiResponse);

  } catch (error) {
    console.error('❌ AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      message: "Sorry, I'm having trouble processing your request. Please try again.",
      error: error.message
    });
  }
};

// Get personalized suggestions
export const getPersonalizedSuggestions = async (req, res) => {
  try {
    const popularItems = await Item.find()
      .populate('shop', 'name address rating') // ✅ Changed from shopId to shop
      .sort({ 'rating.average': -1 }) // ✅ Updated to match your rating structure
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Here are some popular items you might like!",
      suggestions: popularItems
    });

  } catch (error) {
    console.error('❌ Suggestions Error:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching suggestions",
      error: error.message
    });
  }
};
