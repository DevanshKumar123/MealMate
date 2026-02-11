import User from "../models/user.model.js"

export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        if(!userId) {
            return res.status(400).json({message:"userId Not Found"})
        }
        const user = await User.findById(userId)
        if(!user) {
            return res.status(400).json({message:"User Not Found"})
        }
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({message:`getCurrent User Error ${error}`})
        
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon, city, state, address } = req.body;
        
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        // Get userId from auth middleware
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                location: {
                    type: "Point",
                    coordinates: [Number(lon), Number(lat)]
                },
                city: city || undefined,
                state: state || undefined,
                address: address || undefined
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Location updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update location error:", error);
        return res.status(500).json({ 
            message: "Failed to update location",
            error: error.message 
        });
    }
};

