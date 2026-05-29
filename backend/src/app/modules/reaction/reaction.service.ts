import ApiError from "../../../errors/api_error";
import { ITokenPayload } from "../../../interfaces/token";
import { User } from "../user/user.model";
import httpStatus from "http-status";
import { Reaction } from "./reaction.model";
import { Types } from "mongoose";
import { Post } from "../post/post.model";

const toggleReaction = async (
  postId: string,
  type: string = "like",
  token: ITokenPayload
) => {
  const { email } = token;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }
  const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } });
  if (!post) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Post not found!");
  }

  const existingReaction = await Reaction.findOne({
    postId: new Types.ObjectId(postId),
    userId: user._id,
  });

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Remove reaction if clicking the same one
      await Reaction.deleteOne({ _id: existingReaction._id });
      return { message: "Reaction removed", type: null };
    } else {
      // Update reaction type
      existingReaction.type = type;
      await existingReaction.save();
      return { message: "Reaction updated", type };
    }
  } else {
    const newReaction = await Reaction.create({
      postId: new Types.ObjectId(postId),
      userId: user._id,
      type: type,
    });
    return { message: "Reaction added", type: newReaction.type };
  }
};

export const ReactionService = {
  toggleReaction,
};
