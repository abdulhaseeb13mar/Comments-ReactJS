import React, { useState, useEffect } from "react";
import "./Comments.scss";
import { Avatar, makeStyles } from "@material-ui/core";
import AV from "../../assets/dummyDP.jpg";
import Heart from "../../assets/heartIcon.png";
import FillHeart from "../../assets/filledheartIcon.png";
import Reply from "../../assets/replyIcon.png";

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
}));

// this is the most basic comment component you can say the UI of a fundamental comment is here
// every parent comment and reply comment use this component to render itself

const CommentStructure = (props) => {
  useEffect(() => {
    checkUserHeart();
  }, []);

  const [isHeart, setIsHeart] = useState(false);
  const classes = useStyles();

  //when this component is mounted it will check if user has already liked this comment or not
  // it will render heart icon according to it
  const checkUserHeart = () => {
    const userLikedArray = props.likes.usersLiked;
    for (let i = 0; i < userLikedArray.length; i++) {
      if (
        props.CurrentUser ===
        userLikedArray[i][Object.keys(userLikedArray[i])[0]]
      ) {
        setIsHeart(true);
        break;
      }
    }
  };

  // this function is called when user click on the reply icon or reply text
  const handleReply = () => {
    props.handleReply(props.commentId);
  };

  // this function is called when user clicks on the heart icon
  const handleHeart = () => {
    props.thisReplyCommentId
      ? props.handleHeart(props.commentId, props.thisReplyCommentId, () => {
          setIsHeart(!isHeart);
        })
      : props.handleHeart(props.commentId, null, () => {
          setIsHeart(!isHeart);
        });
  };

  return (
    <div className="cm-Wrapper">
      <div className="Main-Comment-Div">
        <div className="Main-Comment-avatar-div">
          <Avatar alt="avatar" src={AV} className={classes.large} />
        </div>
        <div className="Main-Comment-content-div">
          <div className="Main-Comment-username">{props.username}</div>
          <div className="Main-Comment-comment">{props.text}</div>
          <div className="Main-Comment-icons-div">
            <div className="Main-Comment-heart-icon-div">
              <img
                src={isHeart ? FillHeart : Heart}
                alt="heart"
                className="heart-icon"
                onClick={handleHeart}
              />
              <div
                className="Main-Comment-heart-icon-text"
                onClick={() => props.showLikes(props.likes.usersLiked)}
                style={{
                  fontWeight: props.likes.numbers > 0 ? "bold" : "unset",
                }}
              >
                {props.likes.numbers === 0
                  ? "Like"
                  : `${props.likes.numbers} ${
                      props.likes.numbers === 1 ? "Like" : "Likes"
                    }`}
              </div>
            </div>
            <div className="Main-Comment-reply-icon-div" onClick={handleReply}>
              <img src={Reply} alt="reply" className="reply-icon" />
              <div
                className="Main-Comment-reply-icon-text"
                onClick={handleReply}
              >
                Reply
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommentStructure);
