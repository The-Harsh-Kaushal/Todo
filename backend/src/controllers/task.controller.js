import taskSchema from "../models/taskSchema.js";
import listSchema from "../models/listSchema.js";
import userSchema from "../models/userSchema.js";
import commentSchema from "../models/commentSchema.js";
import { sendEmail } from "../utils/send_email.js";
import {
  task_status_change_html,
  task_assignment_html,
} from "../view/task_status_html.js";
import mongoose from "mongoose";

const createTask = async (req, res, next) => {
  const { list_id } = req.params;
  const { id } = req.user;
  const { task_name, task_description, task_deadline } = req.body;
  if (!list_id || !task_name || !task_description || !task_deadline) {
    return res.status(400).json({
      msg: "fill all the required fields",
    });
  }
  try {
    const list = await listSchema.findById(list_id);
    if (!list) {
      return res.status(400).send("List not found");
    }
    if (list.owner.toString() !== id)
      return res.status(400).send("Unauthorized");
    const lastTask = await taskSchema
      .findOne({ list: list_id })
      .sort({ order: -1 });

    const deadline = new Date(task_deadline);
    const task = new taskSchema({
      name: task_name,
      list: list_id,
      owner: list.owner,
      description: task_description,
      deadline: deadline,
      order: lastTask ? lastTask.order + 1 : 1,
    });
    await task.save();
    res.status(200).json({ msg: "Task added" });
  } catch (err) {
    console.log("Error occurred while adding task:", err);
    res.status(500).send("Internal Server Error");
  }
};
const taskDetails = async (req, res, next) => {
  const { task_id } = req.params;
  if (!task_id) {
    return res.status(400).json({
      msg: "fill all the required fields",
    });
  }
  try {
    const task = await taskSchema
      .findById(task_id)
      .populate("collabrators", "name email")
      .populate("owner", "name email");
    if (!task) {
      return res.status(400).send("Task not found");
    }
    res.status(200).json(task);
  } catch (err) {
    console.log("Error occurred while getting task details:", err);
    res.status(500).send("Internal Server Error");
  }
};
const updateTask = async (req, res, next) => {
  const { task_id } = req.params;
  const task_name = req.body.task_name;
  const task_description = req.body.task_description;
  const task_deadline = req.body.task_deadline;
  const task_priority = req.body.task_priority;
  if (!task_id) return res.status(400).json({ msg: "select a task to update" });

  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }
    if (task.owner.toString() !== req.user.id) {
      return res.status(400).send("Unauthorized");
    }
    if (task_name) task.name = task_name;
    if (task_description) task.description = task_description;
    if (task_deadline) task.deadline = task_deadline;
    if (task_priority) task.priority = task_priority;
    await task.save();
    res.status(200).json({ msg: "Task updated" });
  } catch (err) {
    console.log("Error occurred while updating task:", err);
  }
};
const taskStatusUpdate = async (req, res, next) => {
  const { task_id } = req.params;
  const { id, name, email } = req.user;
  if (!task_id) return res.status(400).json({ msg: "select a task to update" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }

    if (id != task.owner && !task.collabrators.includes(id)) {
      return res.status(400).send("Unauthorized");
    }
    task.status = !task.status;
    await task.save();
    const owner = await userSchema.findById(task.owner);
    const { subject, html } = task_status_change_html(
      name,
      task.name,
      task.status,
    );
    sendEmail(owner.email, subject, html);
    res.status(200).json({ msg: "Task status updated" });
  } catch (err) {
    console.log("Error occurred while updating task status:", err);
    res.status(500).send("Internal Server Error");
  }
};
const deleteTask = async (req, res, next) => {
  const { task_id } = req.params;
  const { id } = req.user;
  if (!task_id) return res.status(400).json({ msg: "select a task to delete" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }
    if (task.owner.toString() !== id)
      return res.status(400).send("unauthorized");

    await commentSchema.deleteMany({ task: task._id });
    await taskSchema.deleteOne({ _id: task_id });
    await taskSchema.updateMany(
      { order: { $gt: task.order } },
      { $inc: { order: -1 } },
    );
    res.status(200).json({ msg: "Task deleted" });
  } catch (err) {
    console.log("Error occurred while deleting task:", err);
    res.status(500).send("Internal Server Error");
  }
};
const assignTask = async (req, res, next) => {
  const { task_id } = req.params;
  const { id } = req.user;
  const { email } = req.body;
  if (!task_id) return res.staus(400).json({ msg: "select a task to assign" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }
    if (task.owner.toString() !== id) {
      return res.status(400).send("Unauthorized");
    }
    const collabrator = await userSchema.findOne({ email });
    if (!collabrator) {
      return res.status(400).send("Collabrator not found");
    }
    if (task.collabrators.includes(collabrator._id)) {
      return res.status(400).json({ msg: "Task already assigned" });
    }
    task.collabrators.push(collabrator._id);
    await task.save();
    const assignedTo = {
      _id: collabrator._id,
      name: collabrator.name,
      email: collabrator.email,
    };
    const { subject, html } = task_assignment_html(collabrator.name, task.name);
    sendEmail(collabrator.email, subject, html);
    res.status(200).json({ assignedTo });
  } catch (err) {
    console.log("Error occurred while assigning task:", err);
    res.status(500).send("Internal Server Error");
  }
};
const getAllTasks = async (req, res, next) => {
  const { list_id } = req.params;
  let { offset = 0, limit = 10 } = req.query;

  if (!list_id)
    return res.status(400).json({ msg: "select a list to get tasks" });

  try {
    const list = await listSchema.findById(list_id);
    if (!list) {
      return res.status(400).send("List not found");
    }

    // Convert to numbers and prevent negative values
    offset = Math.max(parseInt(offset) || 0, 0);
    limit = Math.max(parseInt(limit) || 10, 1);

    const tasks = await taskSchema
      .find({ list: list_id })
      .skip(offset)
      .limit(limit)
      .sort({ order: 1 })
      .populate("collabrators", "name email")
      .populate("owner", "name email");

    res.status(200).json(tasks);
  } catch (err) {
    console.log("Error occurred while getting tasks:", err);
    res.status(500).send("Internal Server Error");
  }
};

const changeOrder = async (req, res) => {
  const { task_id } = req.params;
  const { new_order } = req.body;
  const { id } = req.user;

  if (!task_id) return res.status(400).send("Choose a task to change order");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const task = await taskSchema.findById(task_id).session(session);

    if (!task) {
      await session.abortTransaction();
      return res.status(400).send("No such task exists");
    }

    if (id != task.owner && !task.collaborators.includes(id)) {
      await session.abortTransaction();
      return res.status(400).send("Unauthorized");
    }

    const old_order = task.order;

    if (new_order === old_order) {
      await session.abortTransaction();
      return res.status(200).send("No change needed");
    }

    const max_tasks = await taskSchema
      .countDocuments({ list: task.list })
      .session(session);

    if (new_order < 1 || new_order > max_tasks) {
      await session.abortTransaction();
      return res.status(400).send("Choose a valid order");
    }

    if (new_order < old_order) {
      // Moving up
      await taskSchema.updateMany(
        {
          list: task.list,
          order: { $gte: new_order, $lt: old_order },
        },
        { $inc: { order: 1 + max_tasks } },
        { session },
      );
      task.order = new_order;
      await task.save({ session });
      await taskSchema.updateMany(
        {
          list: task.list,
          order: { $gt: max_tasks },
        },
        { $inc: { order: -max_tasks } },
        { session },
      );
    } else {
      // Moving down
      await taskSchema.updateMany(
        {
          list: task.list,
          order: { $gt: old_order, $lte: new_order },
        },
        { $inc: { order: -1 + max_tasks } },
        { session },
      );
      task.order = new_order;
      await task.save({ session });
      await taskSchema.updateMany(
        {
          list: task.list,
          order: { $gt: max_tasks },
        },
        { $inc: { order: -max_tasks } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).send("Order updated");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.log("Error while changing task order:", err);
    res.status(500).send("Internal server error");
  }
};

export default {
  createTask,
  taskDetails,
  updateTask,
  taskStatusUpdate,
  deleteTask,
  assignTask,
  getAllTasks,
  changeOrder,
};
