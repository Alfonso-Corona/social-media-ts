import { useState } from "react";
import type { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";

interface Props {
  comment: Comment & {
    children?: Comment[];
  };
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in...");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parentCommentId,
    user_id: userId,
    author: author,
  });

  if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;
    mutate(replyText);
    setReplyText("");
    setShowReply(false);
  };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  return (
    <div className="pl-4 border-l border-white/10">
      <div className="mb-2">
        <div className="flex intems-center space-x-2">
          <span className="text-sm font-bold text-blue-400">
            {comment.author}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        <p className="text-gray-300">{comment.content}</p>
        <button
          className="text-blue-500 text-sm mt-1"
          onClick={() => setShowReply((prev) => !prev)}
        >
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>
      {showReply && user && (
        <form className="mb-2" onSubmit={handleReplySubmit}>
          <textarea
            rows={3}
            className="w-full border border-white/10 bg-transparent p-2 rounded"
            value={replyText}
            placeholder="Write a comment..."
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            type="submit"
            className="mt-1 bg-purple-500 text-white px-4 py-1 rounded"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>
          {isError && <p className="text-red-500">Error posting comment</p>}
        </form>
      )}
      {comment.children && comment.children.length > 0 && (
        <div>
          <button onClick={() => setIsCollapsed((prev) => !prev)}>
            {!isCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                ></path>
              </svg>
            )}
          </button>
          {isCollapsed && (
            <div className="space-y-2">
              {comment.children.map((child, key) => (
                <CommentItem key={key} comment={child} postId={postId}/>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
