import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";
import mongoose from "mongoose";
const addComment = async (req, res, next) => {
  const { task_id } = req.params;
  const { comment } = req.body;
  const { id ,name ,email } = req.user;
  if (!task_id)
    return res.status(400).json({ msg: "select a task to add comment" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }
    const newComment = new commentSchema({
      text: comment,
      owner: id,
      task: task_id,
    });
    await newComment.save();
    const temp = {
      _id: newComment._id,
      date: newComment.date,
      text: newComment.text,
      task: task_id,
      ownerdetails:{
        _id:id,
        email,
        name,
      }
    }
    res.status(200).json(temp);
  } catch (err) {
    console.log("Error occurred while adding comment:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const deleteComment = async (req, res, next) => {
  const { task_id, comment_id } = req.params;
  const { id } = req.user;
  if (!task_id)
    return res.status(400).json({ msg: "select a task to delete comment" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }
    const comment = await commentSchema.findById(comment_id);
    if (!comment) {
      return res.status(400).json({ msg: "Comment not found" });
    }
    if (id !== comment.owner.toString() && id !== task.owner.toString())
      return res.status(400).json({ msg: "You can delete only your comments" });
    await commentSchema.deleteOne({ _id: comment_id });
    res.status(200).json({ msg: "Comment deleted" });
  } catch (err) {
    console.log("Error occurred while deleting comment:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getAllComments = async (req, res, next) => {
  const { task_id } = req.params;
  let { offset = 0, limit = 10 } = req.query;

  if (!task_id) {
    return res.status(400).json({ msg: "select a task to get comments" });
  }

  if (!mongoose.Types.ObjectId.isValid(task_id)) {
    return res.status(400).json({ msg: "Invalid task id" });
  }

  try {
    offset = parseInt(offset);
    limit = parseInt(limit);

    if (isNaN(offset) || offset < 0) offset = 0;
    if (isNaN(limit) || limit <= 0) limit = 10;

    const taskObjectId = new mongoose.Types.ObjectId(task_id);

    const comments = await commentSchema.aggregate([
      {
        $match: {
          task: taskObjectId, // ✅ FIXED
        },
      },
      { $sort: { date: -1 } }, // 🔥 you forgot sorting
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerdetails",
        },
      },
      { $unwind: "$ownerdetails" },
      {
        $project: {
          text: 1,
          date: 1,
          task:1,
          ownerdetails: {
            name: 1,
            email: 1,
          },
        },
      },
    ]);

    res.status(200).json({ comments });

  } catch (err) {
    console.log("Error occurred while getting comments:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
export default { addComment, deleteComment, getAllComments };
