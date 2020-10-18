import React, { useState } from "react";
import "./Comments.scss";
import CommentStructure from "./commentStructure";

const Comment = (props) => {
  const [showReplies, setShowReplies] = useState(false);

  const ShowReplies = () => setShowReplies(true);
  const Hidereplies = () => setShowReplies(false);

  // it will not show the replies initially you can see replies by clicking on View Replies

  return (
    <div className="CM-Wrapper">
      {/* this the parent comment */}
      <CommentStructure
        commentId={props.commentId}
        CurrentUser={props.CurrentUser}
        username={props.username}
        text={props.text}
        likes={props.likes}
        avatar={props.avatar}
        showLikes={(likes) => props.showLikes(likes)}
        handleHeart={(ParentCmtID, ReplyCmtID, ChangeHeart) =>
          props.handleHeart(ParentCmtID, ReplyCmtID, ChangeHeart)
        }
        handleReply={(cmtID) => props.handleReply(cmtID)}
      />
      <div className="reply-container">
        {!showReplies && props.replies.length > 0 ? (
          <p className="view-replies" onClick={ShowReplies}>
            View Replies
          </p>
        ) : null}
        {showReplies
          ? props.replies.map((reply, index) => {
              // all the replies of this comment is rendered here
              return (
                <CommentStructure
                  thisReplyCommentId={reply.commentId}
                  commentId={props.commentId}
                  CurrentUser={props.CurrentUser}
                  username={reply.username}
                  text={reply.comment}
                  likes={reply.likes}
                  avatar={reply.avatar}
                  showLikes={(likes) => props.showLikes(likes)}
                  handleHeart={(ParentCmtID, ReplyCmtID, ChangeHeart) =>
                    props.handleHeart(ParentCmtID, ReplyCmtID, ChangeHeart)
                  }
                  handleReply={(cmtID) => props.handleReply(cmtID)}
                />
              );
            })
          : null}
        {showReplies && props.replies.length > 0 ? (
          <p className="hide-replies" onClick={Hidereplies}>
            Hide Replies
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(Comment);
