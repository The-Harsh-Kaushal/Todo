import userSchema from "../models/userSchema.js";
import boardSchema from "../models/boardSchema.js";
import taskSchema from "../models/taskSchema.js";
import listSchema from "../models/listSchema.js";
import commentSchema from "../models/commentSchema.js";
import mongoose from "mongoose";

const getBoards = async (req, res, next) => {
  let { offset = 0, limit = 10, startswith } = req.query;

  // convert safely to numbers
  offset = Math.max(parseInt(offset) || 0, 0);
  limit = Math.max(parseInt(limit) || 10, 1);

  let matchStage = { $match: {} };

  if (startswith) {
    const escapedWord = startswith.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const usersid = await boardSchema.find(
      { name: { $regex: escapedWord, $options: "i" } },
      { _id: 1 },
    );

    const userIds = usersid.map((item) => item._id);

    matchStage = {
      $match: {
        $or: [
          { name: { $regex: escapedWord, $options: "i" } },
          { owner: { $in: userIds } },
        ],
      },
    };
  }

  try {
    const boards = await boardSchema.aggregate([
      matchStage,
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          let: { ownerId: "$owner" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$ownerId"] },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
                _id: 0,
              },
            },
          ],
          as: "ownerDetails",
        },
      },
      {
        $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "lists",
          let: { boardId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$board", "$$boardId"] },
              },
            },
            {
              $count: "totallists",
            },
          ],
          as: "lists",
        },
      },
      {
        $unwind: { path: "$lists", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          ownerDetails: 1,
          listcount: { $cond: ["$lists.totallists", "$lists.totallists", 0] },
        },
      },
    ]);

    res.status(200).json({ boards });
  } catch (error) {
    console.log("Error occurred while getting boards:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const creteBoard = async (req, res, next) => {
  const { id, name, email } = req.user;
  const board_name = req.body.name;
  if (!board_name) return res.status(400).json({ msg: "enter a vlaid name " });
  try {
    const board = new boardSchema({ name: board_name, owner: id });
    await board.save();
    const new_board = {
      _id: board._id,
      name: board.name,
      ownerDetails: {
        name,
        email,
      },
      listcount: 0,
    };
    res.status(200).json({ new_board });
  } catch (error) {
    console.log("Error occurred while creating board:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
// const getBoardDetails = async(req,res,next)=>{
//     const {board_id} = req.params;
//     try {
//         const board = await boardSchema.findById(board_id);
//         if(!board){
//             return res.status(400).json({ msg: "Board not found" });
//         }

//         res.status(200).json({msg:"Board details",board});
//     } catch (error) {
//         console.log("Error occurred while getting board details:", error);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// }
const updateBoard = async (req, res, next) => {
  const { board_id } = req.params;
  const { id } = req.user;
  const { new_name } = req.body;
  try {
    const board = await boardSchema.findById(board_id);
    if (!board) {
      return res.status(400).json({ msg: "Board not found" });
    }
    if (board.owner.toString() !== id) {
      return res.status(400).json({ msg: "Unauthorized" });
    }
    board.name = new_name;
    await board.save();
    res.status(200).json({ msg: "Board updated" });
  } catch (err) {
    console.log("Error occurred while updating board:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const deleteBoard = async (req, res, next) => {
  const { board_id } = req.params;
  const { id } = req.user;
  if (!mongoose.Types.ObjectId.isValid(board_id)) {
    return res.status(400).json({ msg: "Invalid board id" });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const board = await boardSchema.findById(board_id).session(session);
      if (!board) {
        const err = new Error("Board not found");
        err.status = 404;
        throw err;
      }
      if (board.owner.toString() !== id) {
        const err = new Error("Unauthorized");
        err.status = 403;
        throw err;
      }

      const lists = await listSchema
        .find({ board: board_id })
        .select("_id")
        .session(session);
      const listIdArray = lists.map((list) => list._id);

      const tasks = await taskSchema
        .find({ list: { $in: listIdArray } })
        .select("_id")
        .session(session);
      const taskIdArray = tasks.map((task) => task._id);

      await commentSchema
        .deleteMany({ task: { $in: taskIdArray } })
        .session(session);
      await taskSchema.deleteMany({ list: { $in: listIdArray } }).session(session);
      await listSchema.deleteMany({ board: board_id }).session(session);
      await boardSchema.deleteOne({ _id: board_id }).session(session);
    });

    res.status(200).json({ msg: "Board deleted" });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
    console.log("Error occurred while deleting board:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
};

export default { getBoards, creteBoard, updateBoard, deleteBoard };
