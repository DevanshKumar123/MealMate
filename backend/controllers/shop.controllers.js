import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image = null;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // ✅ Find existing shop by owner
    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      // create new shop
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      // update existing shop
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image: image || shop.image, // keep old image if no new one
        },
        { new: true }
      );
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create Shop Error: ${error.message}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
      })

    if (!shop) {
      return res.status(200).json(null);
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get My Shop Error: ${error.message}` });
  }
};


export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({}).populate('items');
    if (!shops || shops.length === 0) {
      return res.status(200).json({ message: "Shops not Found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `Get All Shops Error: ${error.message}` });
  }
}