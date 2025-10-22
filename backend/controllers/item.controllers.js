import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// -----------------
// Add Item
// -----------------
export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    if (!name || !category || !foodType || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) return res.status(400).json({ message: "Shop not found" });

    const item = await Item.create({ name, category, foodType, price, image, shop: shop._id });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate("items");

    return res.status(201).json(shop);

  } catch (error) {
    return res.status(500).json({ message: `Add item error: ${error.message}` });
  }
};

// -----------------
// Edit Item
// -----------------
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;

    let updateData = { name, category, foodType, price };
    if (req.file) updateData.image = await uploadOnCloudinary(req.file.path);

    const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true });
    if (!item) return res.status(400).json({ message: "Item not found" });

    const shop = await Shop.findOne({ owner: req.userId }).populate("items");
    return res.status(200).json(shop);

  } catch (error) {
    return res.status(500).json({ message: `Edit item error: ${error.message}` });
  }
};

// -----------------
// Get Item by ID
// -----------------
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(400).json({ message: "Item not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `Get item error: ${error.message}` });
  }
};

// -----------------
// Delete Item
// -----------------
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.itemId);
    if (!item) return res.status(400).json({ message: "Item not found" });

    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter(i => i.toString() !== item._id.toString());
    await shop.save();
    await shop.populate("items");

    return res.status(200).json(shop);

  } catch (error) {
    return res.status(500).json({ message: `Delete item error: ${error.message}` });
  }
};

// -----------------
// Get Items by City
// -----------------
export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) return res.status(400).json({ message: "City is required" });

    const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } }).populate("items");
    if (!shops || shops.length === 0) return res.status(404).json({ message: "Shops not found in this city" });

    const shopIds = shops.map(shop => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } });

    return res.status(200).json(items);

  } catch (error) {
    return res.status(500).json({ message: `Get item by city error: ${error.message}` });
  }
};

// -----------------
// Get Items by Shop
// -----------------
export const getItemsByShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).populate("items");
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    return res.status(200).json({ shop, items: shop.items });
  } catch (error) {
    return res.status(500).json({ message: `Get items by shop error: ${error.message}` });
  }
};

// -----------------
// Search Items
// -----------------
export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) return res.status(400).json({ message: "Query and city are required" });

    const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } });
    if (!shops || shops.length === 0) return res.status(404).json({ message: "Shops not found" });

    const shopIds = shops.map(s => s._id);
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).populate("shop", "name image");

    return res.status(200).json(items);

  } catch (error) {
    return res.status(500).json({ message: `Search items error: ${error.message}` });
  }
};

// -----------------
// Rating
// -----------------
export const rating = async (req, res) => {
  try {
    const { itemId, rating: rate } = req.body;
    if (!itemId || !rate) return res.status(400).json({ message: "itemId and rating are required" });
    if (rate < 1 || rate > 5) return res.status(400).json({ message: "Rating must be between 1 to 5" });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.rating.count += 1;
    item.rating.average = (item.rating.average * (item.rating.count - 1) + rate) / item.rating.count;
    await item.save();

    return res.status(200).json({ rating: item.rating });

  } catch (error) {
    return res.status(500).json({ message: `Rating error: ${error.message}` });
  }
};
