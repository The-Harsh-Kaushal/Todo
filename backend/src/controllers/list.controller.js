import boardSchema from "../models/boardSchema.js";
import listSchema from "../models/listSchema.js";
import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";
import { order_resolver } from "../utils/order_resolver.js";
const AddList = async (req, res, next) => {
  const { board_id } = req.params;
  const { list_name } = req.body;
  const { id } = req.user;
  if (!list_name) {
    return res.status(400).json({ msg: "fill the required fields" });
  }
  if (!board_id) {
    return res.status(400).json({ msg: "board not found" });
  }
  try {
    const board = await boardSchema.findById(board_id);
    if (!board) {
      return res.status(400).send("Board not found");
    }
    if (id.toString() !== board.owner.toString()) {
      return res.status(400).send("Unauthorized");
    }

    const lastList = await listSchema
      .findOne({ board: board_id })
      .sort({ order: -1 })
      .select("order");
    let new_order;
    if (!lastList) new_order = "a";
    else {
      new_order = order_resolver(lastList.order, "");
    }
    if (!new_order)
      return res.status(500).json({ msg: "internal server error" });
    const list = new listSchema({
      name: list_name,
      owner: id,
      board: board_id,
      order: new_order,
    });
    await list.save();
    res.status(200).json({ msg: "List added" });
  } catch (err) {
    console.log("Error occurred while adding list:", err);
    res.status(500).send("Internal Server Error");
  }
};
const UpdateList = async (req, res, next) => {
  const { list_id } = req.params;
  const { list_name } = req.body;
  const { id } = req.user;
  if (!list_id || !list_name) {
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
      return res.status(400).json({ msg: "unauthorized" });
    list.name = list_name;
    await list.save();
    res.status(200).json({ msg: "List updated" });
  } catch (err) {
    console.log("Error occurred while updating list:", err);
    res.status(500).send("Internal Server Error");
  }
};
const DeleteList = async (req, res, next) => {
  const { list_id } = req.params;
  const { id } = req.user;
  if (!list_id) return res.status(400).json({ msg: "select a list to delete" });
  try {
    const list = await listSchema.findById(list_id);
    if (!list) {
      return res.status(400).send("List not found");
    }
    if (list.owner.toString() !== id)
      return res.status(400).json({ msg: "forbidden" });
    const tasks = await taskSchema.find({ list: list_id }).select("_id");
    await commentSchema.deleteMany({ task: { $in: tasks } });
    await taskSchema.deleteMany({ list: list_id });
    await listSchema.deleteOne({ _id: list_id });
    res.status(200).json({ msg: "List deleted" });
  } catch (err) {
    console.log("Error occurred while deleting list:", err);
    res.status(500).send("Internal Server Error");
  }
};
const ChangeOrder = async (req, res, next) => {
  const { list_id } = req.params;
  const { LB, TB } = req.body;

  if (!list_id || (!LB && !TB))
    return res.status(400).json({
      msg: "fill the requried fields",
    });
  try {
    const list = await listSchema.findById(list_id);
    if (!list) {
      return res.status(400).send("List not found");
    }

    const new_order = order_resolver(LB, TB);
    if (!new_order) return res.status(500).send("internal server error");
    list.order = new_order;
    await list.save();
    res.status(200).json({ msg: "List order updated" });
  } catch (err) {
    console.log("Error occurred while updating list order:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getLists = async (req, res, next) => {
  const { board_id } = req.params;
  const { page } = req.query;
  if (!board_id)
    return res.status(400).json({ msg: "select a board to get lists" });
  try {
    const board = await boardSchema.findById(board_id);
    if (!board) {
      return res.status(400).send("Board not found");
    }
    const lists = await listSchema
      .find({ board: board_id })
      .skip(page * 10)
      .limit(10)
      .sort({ order: 1 });

    res.status(200).json({ lists: lists });
  } catch (error) {
    console.log("Error occurred while getting lists:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default { AddList, UpdateList, DeleteList, ChangeOrder, getLists };
