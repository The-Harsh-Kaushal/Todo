import taskSchema from "../models/taskSchema.js";
import listSchema from "../models/listSchema.js";
import userSchema from "../models/userSchema.js";
import commentSchema from "../models/commentSchema.js";
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

    const deadline = new Date(task_deadline);
    const task = new taskSchema({
      name: task_name,
      list: list_id,
      owner: list.owner,
      description: task_description,
      deadline: deadline,
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
  if (!task_id) return res.status(400).json({ msg: "select a task to update" });

  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }
    if (task.owner.toString() !== req.user.unique_id) {
      return res.status(400).send("Unauthorized");
    }
    if (task_name) task.name = task_name;
    if (task_description) task.description = task_description;
    if (task_deadline) task.deadline = task_deadline;
    await task.save();
    res.status(200).json({ msg: "Task updated" });
  } catch (err) {
    console.log("Error occurred while updating task:", err);
  }
};
const taskStatusUpdate = async (req, res, next) => {
  const { task_id } = req.params;
  if (!task_id) return res.status(400).json({ msg: "select a task to update" });
  try {
    const task = await taskSchema.findById(task_id);
    if (!task) {
      return res.status(400).send("Task not found");
    }
    task.status = !task.status;
    await task.save();
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
    res.status(200).json({ msg: "Task assigned" });
  } catch (err) {
    console.log("Error occurred while assigning task:", err);
    res.status(500).send("Internal Server Error");
  }
};
const getAllTasks = async (req, res, next) => {
  const { list_id } = req.params;
  const { page } = req.query;
  if (!list_id)
    return res.status(400).json({ msg: "select a list to get tasks" });
  try {
    const list = await listSchema.findById(list_id);
    if (!list) {
      return res.status(400).send("List not found");
    }
    const tasks = await taskSchema
      .find({ list: list_id })
      .skip(page * 10)
      .limit(10)
      .sort({ order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.log("Error occurred while getting tasks:", err);
    res.status(500).send("Internal Server Error");
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
};
