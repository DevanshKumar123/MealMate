// import User from "./models/user.model"

// export const socketHandler = (io) => {
//     io.on('connection',(socket) => {
//         socket.on('identity',async ({userId}) => {
//             try {
//                 const user = await User.findByIdAndUpdate(userId, {
//                     socketId: socket.id , isOnline:true
//                 },{new:true})
//             } catch (error) {
//                 console.log(error)
//             }
//         })
//     })
// }

import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("identity", async ({ userId }) => {
      try {
        if (!userId) return;
        await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id, isOnline: true },
          { new: true }
        );
        console.log(`User ${userId} set online with socket ${socket.id}`);
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
          io.emit("updateDeliveryLocation", {
            deliveryBoyId: userId,
            latitude,
            longitude
          });
        }
      } catch (error) {
        console.log('Update Delivery Location Error');
      }
    });

    socket.on("disconnect", async (reason) => {
      try {
        console.log("Socket disconnected:", socket.id, reason);
        // find user by socketId and mark offline
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
