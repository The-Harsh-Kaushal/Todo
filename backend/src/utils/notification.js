import mongoose from "mongoose";
import notificationsSchema from "../models/notificationsSchema.js";

const createNotificationfn = async ({ owner, title, message }) => {
  try {
    const newNotification = new notificationsSchema({
      owner,
      title,
      message,
    });
    await newNotification.save();
    return { success: true, msg: "successfull" };
  } catch (err) {
    console.log("Error while creating Notification ", err);
    return { success: false, msg: err };
  }
};

const readNotificaionfn = async ({ id }) => {
  try {
    const notification = await notificationsSchema.findById(id);
    if (!notification) return { success: false, msg: "failed" };
    notification.read = true;
    await notification.save();
    return { success: true, msg: "successfull" };
  } catch (err) {
    console.log("Error while creating Notification ", err);
    return { success: false, msg: err };
  }
};

const getNotificationsfn = async ({ id, notSeen, offset, limit }) => {
  try {
    if (typeof id === "string") {
      id = new mongoose.Types.ObjectId(id);
    }
    let secondMatch = {
      $match: {},
    };
    if (!offset || typeof offset !== "number") offset = 0;
    if (!limit || typeof limit !== "number") limit = 20;
    if (notSeen) secondMatch = { $match: { read: false } };
    const notifications = await notificationsSchema.aggregate([
      {
        $match: {
          owner: id,
        },
      },
      secondMatch,
      { $skip: offset },
      { $limit: limit },
    ]);
    return { success: true, msg: "successfull", data: notifications };
  } catch (err) {
    console.log("Error while creating Notification ", err);
    return { success: false, msg: err };
  }
};
export default { readNotificaionfn, getNotificationsfn, createNotificationfn };
