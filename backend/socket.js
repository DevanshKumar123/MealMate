import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identity", async ({ userId }) => {
      try {
        if (!userId) return;
        await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id, isOnline: true },
          { new: true }
        );
      } catch (error) {
        console.error("Socket identity error:", error);
      }
    });

    socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });
        if (user) {
          // Broadcast to all connected clients
          io.emit("updateDeliveryLocation", {
            deliveryBoyId: userId,
            latitude: Number(latitude),
            longitude: Number(longitude)
          });
        }
      } catch (error) {
        console.error('Update Delivery Location Error:', error);
      }
    });

    socket.on("disconnect", async (reason) => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null }
        );
      } catch (error) {
        console.error("Socket disconnect error:", error);
      }
    });
  });
};
