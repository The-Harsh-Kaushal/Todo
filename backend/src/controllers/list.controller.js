import boardSchema from "../models/boardSchema.js";
import listSchema from "../models/listSchema.js";
import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";
import { order_resolver } from "../utils/order_resolver.js";
import mongoose from "mongoose";
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
    const new_list = {
      name: list.name,
      order: list.order,
      totalTasks: 0,
      finishedTasks: 0,
    };
    res.status(200).json({ new_list});
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
  let { offset = 0, limit = 10, operator, value } = req.query;

  value = Number(value);

  // convert safely
  offset = Math.max(parseInt(offset) || 0, 0);
  limit = Math.max(parseInt(limit) || 10, 1);

  let matchStage = { $match: {} };

  if (operator && !isNaN(value)) {
    let operation;

    if (operator === "gt") operation = "$gt";
    else if (operator === "gte") operation = "$gte";
    else if (operator === "lt") operation = "$lt";
    else if (operator === "lte") operation = "$lte";
    else if (operator === "eq") operation = "$eq";
    else return res.status(400).send("Operator is not valid");

    matchStage = {
      $match: {
        totalTasks: { [operation]: value },
      },
    };
  }

  if (!board_id)
    return res.status(400).json({ msg: "select a board to get lists" });

  try {
    const board = await boardSchema.findById(board_id);
    if (!board) {
      return res.status(400).send("Board not found");
    }

    const lists = await listSchema.aggregate([
      {
        $match: {
          board: new mongoose.Types.ObjectId(board_id),
        },
      },
      {
        $lookup: {
          from: "tasks",
          let: { listId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$list", "$$listId"] },
              },
            },
            {
              $facet: {
                totalCount: [{ $count: "totalTasks" }],
                finished: [
                  { $match: { status: true } },
                  { $count: "total" },
                ],
              },
            },
            {
              $unwind: {
                path: "$totalCount",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$finished",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                totalTasks: "$totalCount.totalTasks",
                finishedTasks: "$finished.total",
              },
            },
          ],
          as: "otherData",
        },
      },
      { $unwind: "$otherData" },
      {
        $project: {
          name: 1,
          order: 1,
          totalTasks: {
            $cond: ["$otherData.totalTasks", "$otherData.totalTasks", 0],
          },
          finishedTasks: {
            $cond: ["$otherData.finishedTasks", "$otherData.finishedTasks", 0],
          },
        },
      },
      matchStage,
      { $sort: { order: 1 } },
      { $skip: offset },
      { $limit: limit },
    ]);

    res.status(200).json({ lists });
  } catch (error) {
    console.log("Error occurred while getting lists:", error);
    res.status(500).send("Internal Server Error");
  }
};
// const getAssignedList= async(req,res,next)=>{
//   const {id}=req.user;
//   try{
//     const list = 
//   }
// }
export default { AddList, UpdateList, DeleteList, ChangeOrder, getLists };
