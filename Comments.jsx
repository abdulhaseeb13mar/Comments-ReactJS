/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  withStyles,
} from "@material-ui/core";
import { connect } from "react-redux";
import "./Comments.scss";
import { Grid, TextField, Button } from "@material-ui/core";
import Comment from "./comment.jsx";
import { dummyComments } from "./dummycomments";

//---------------NOTE-----------------
// this whole comment component is strictly depending on the format pattern of comments array (see dummyComments.js to see format)
// in order for this component to work you make sure that you are providing the exact same format pattern of comments Array
// if you have a different format then make sure you understand all the flow so that you can change it according to your needs

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogLikes: [],
      commentsArray: [],
      ReplyCommentID: "",
      commentText: "",
    };
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  componentWillMount() {
    this.setState({ commentsArray: dummyComments });
  }

  postHeart = (ParentCmtID, ReplyCmtID, ChangeHeart) => {
    // send the post api to backend with [parentCmtID] or [ReplyCmtID] or both depend on the comment/reply
    // when the backend is successfully updated then you can change your frontEnd here by calling this function
    // frontEnd and Backend will at the same state
    this.change_FrontEnd_State_After_PostHeart(
      ParentCmtID,
      ReplyCmtID,
      ChangeHeart
    );
  };

  postComment = () => {
    // send the api to backend to push new comment in parrent comments. if its a reply then send this.state.ReplyCommentID
    // to push new reply to that specific parent comment
    // when the backend is successfully updated then you can change your frontEnd here by calling this function
    // frontEnd and Backend will at the same state
    this.change_FrontEnd_State_After_PostComment();
  };

  handleDialogeClose = () =>
    this.setState({ dialogOpen: false, dialogLikes: [] });

  focusTextInput() {
    this.textInput.current.focus();
  }

  handleReply = (cmtID) => {
    // it will set the state to comment id for which we are currently replying
    this.focusTextInput();
    this.setState({ ReplyCommentID: cmtID });
  };

  handleCommentText = (event) => {
    this.setState({ commentText: event.target.value });
  };

  popUserFromLikedArray = (userId, likedArray) => {
    return likedArray.filter((user) => userId !== user[Object.keys(user)[0]]);
  };

  change_FrontEnd_State_After_PostHeart = (
    ParentCmtID,
    ReplyCmtID,
    ChangeHeart
  ) => {
    // commentsCopy here is deep copy of commentsArray state
    let commentsCopy = copyCommentsArray(this.state.commentsArray);
    let index, oldLikes, UserAlreadyLiked;
    // if replyCmtID exist it means user has liked a reply of some comment so [if] clause will run
    // if replyCmtID is null it means user has liked a parent comment and [else] clause will run
    if (ReplyCmtID) {
      // it will find the index of the parent comment and then its replied comment
      // index will be array here contains index of parent comment and reply comment [parentCommentIndex, replyCommentIndex]
      index = this.findCommentIndex(ParentCmtID, ReplyCmtID);
      // get old likes numbers
      oldLikes = commentsCopy[index[0]].replies[index[1]].likes.numbers;
      // checking if user has already liked this comment
      UserAlreadyLiked = this.checkAlreadyLiked(this.props.userId, index);
      // if user has already liked then we have to minus the number and remove user from likedArray
      // if user has not already liked then we will add the number and add user into likedArray
      if (UserAlreadyLiked) {
        commentsCopy[index[0]].replies[index[1]].likes.numbers = oldLikes - 1;
        commentsCopy[index[0]].replies[
          index[1]
        ].likes.usersLiked = this.popUserFromLikedArray(
          this.props.userId,
          commentsCopy[index[0]].replies[index[1]].likes.usersLiked
        );
      } else {
        commentsCopy[index[0]].replies[index[1]].likes.numbers = oldLikes + 1;
        commentsCopy[index[0]].replies[index[1]].likes.usersLiked.push({
          [this.props.userName]: this.props.userId,
        });
      }
      // change the heart icon its a callback function that is executing in commentStructure.jsx
      ChangeHeart();
      // update the new commentArray
      this.setState({ commentsArray: commentsCopy });
    } else {
      index = this.findCommentIndex(ParentCmtID);
      oldLikes = commentsCopy[index].likes.numbers;
      UserAlreadyLiked = this.checkAlreadyLiked(this.props.userId, index);
      if (UserAlreadyLiked) {
        commentsCopy[index].likes.numbers = oldLikes - 1;
        commentsCopy[index].likes.usersLiked = this.popUserFromLikedArray(
          this.props.userId,
          commentsCopy[index].likes.usersLiked
        );
      } else {
        commentsCopy[index].likes.numbers = oldLikes + 1;
        commentsCopy[index].likes.usersLiked.push({
          [this.props.userName]: this.props.userId,
        });
      }
      ChangeHeart();
      this.setState({ commentsArray: commentsCopy });
    }
  };

  change_FrontEnd_State_After_PostComment = () => {
    // The commentId here is dummy use some library to randomly generate commentId
    const newComment = {
      commentId: "12jhg762qwXOpajgDcaf",
      username: this.props.userName,
      userId: this.props.userId,
      avatar: "",
      likes: {
        numbers: 0,
        usersLiked: [],
      },
      comment: this.state.commentText,
    };
    // if its a parent comment then we will add replies key in newComment
    this.state.ReplyCommentID === "" ? (newComment["replies"] = []) : null;
    // deep copy of commentsArray
    let commentsCopy = copyCommentsArray(this.state.commentsArray);
    // if its not a reply comment then newComment will be added to the array of parent Comments
    // it its a reply comment then newComment will be added to the array of reply comments of that specific parent comment
    if (this.state.ReplyCommentID === "") {
      commentsCopy.push(newComment);
    } else {
      const index = this.findCommentIndex(this.state.ReplyCommentID);
      commentsCopy[index].replies.push(newComment);
    }
    // updating the new commentArray
    this.setState({ commentsArray: commentsCopy, commentText: "" });
  };

  checkAlreadyLiked = (userId, Commentindex) => {
    let usersLikedArray;
    if (Commentindex.length !== undefined) {
      usersLikedArray = this.state.commentsArray[Commentindex[0]].replies[
        Commentindex[1]
      ].likes.usersLiked;
      for (let c = 0; c < usersLikedArray.length; c++) {
        if (userId === usersLikedArray[c][Object.keys(usersLikedArray[c])[0]]) {
          return true;
        }
      }
      return false;
    } else {
      usersLikedArray = this.state.commentsArray[Commentindex].likes.usersLiked;
      for (let i = 0; i < usersLikedArray.length; i++) {
        if (userId === usersLikedArray[i][Object.keys(usersLikedArray[i])[0]]) {
          return true;
        }
      }
      return false;
    }
  };

  findCommentIndex = (CommentIDToFind, ReplyCommentIDToFind) => {
    if (ReplyCommentIDToFind) {
      let parentIndex = this.findCommentIndex(CommentIDToFind);
      let parentRepliesArr = this.state.commentsArray[parentIndex].replies;
      for (let r = 0; r < parentRepliesArr.length; r++) {
        if (parentRepliesArr[r].commentId === ReplyCommentIDToFind) {
          return [parentIndex, r];
        }
      }
    } else {
      for (let j = 0; j < this.state.commentsArray.length; j++) {
        if (this.state.commentsArray[j].commentId === CommentIDToFind) {
          return j;
        }
      }
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div style={{ marginBottom: 100 }}>
        {this.state.commentsArray.length > 0 ? (
          // all the comments are iterated and rendered here through Comment.jsx component
          // Comment.jsx component represent a single parent comment which will contain its replies too if they have any replies
          this.state.commentsArray.map((comment, index) => {
            return (
              <Comment
                key={index}
                CurrentUser={this.props.userId}
                commentId={comment.commentId}
                username={comment.username}
                userId={comment.userId}
                avatar={comment.avatar}
                likes={comment.likes}
                text={comment.comment}
                replies={comment.replies}
                handleReply={(cmtID) => this.handleReply(cmtID)}
                handleHeart={(ParentCmtID, ReplyCmtID, ChangeHeart) =>
                  this.postHeart(ParentCmtID, ReplyCmtID, ChangeHeart)
                }
                showLikes={(likes) =>
                  this.setState({ dialogLikes: likes, dialogOpen: true })
                }
              />
            );
          })
        ) : (
          <p>no commmennts</p>
        )}
        <div className="CM-WriteComment-Container">
          <Grid container xs={11} className="CM-WriteComment-div">
            <Grid
              item
              xs={12}
              sm={12}
              md={9}
              className="CM-WriteComment-Input-div"
            >
              <TextField
                id="outlined-textarea"
                label=""
                placeholder="Write a comment"
                multiline
                variant="outlined"
                fullWidth
                className="CM-WriteComment-Input"
                InputProps={{ classes: { focused: classes.inputFocus } }}
                inputRef={this.textInput}
                onChange={this.handleCommentText}
                value={this.state.commentText}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              className="CM-WriteComment-Btn-div"
            >
              <Button
                id="CM-WriteComment-Btn"
                variant="contained"
                fullWidth
                onClick={this.postComment}
              >
                Post Comment
              </Button>
            </Grid>
          </Grid>
        </div>
        <Dialog
          open={this.state.dialogOpen}
          onClose={() => this.handleDialogeClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="Likes-dialog"
          classes={{ paper: classes.paper }}
        >
          <DialogTitle id="alert-dialog-title">
            {"People who liked"}
          </DialogTitle>
          <DialogContent>
            {this.state.dialogLikes.map((name, index) => {
              return (
                <DialogContentText
                  key={index}
                  id="alert-dialog-description"
                  tabIndex={-1}
                >
                  {Object.keys(name)[0]}
                </DialogContentText>
              );
            })}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const style = (theme) => ({
  paper: {
    maxHeight: "80vh !important",
  },
});

const mapStateToProps = (state) => {
  return {
    userId: state.setUserType.userId,
    userName: state.setUserType.userName,
  };
};

export default React.memo(
  connect(mapStateToProps, null)(withStyles(style)(Comments))
);

export const copyCommentsArray = (commentsArray) => {
  return commentsArray.map((c) => ({
    ...c,
    replies: c.replies.map((r) => ({
      ...r,
      likes: {
        numbers: r.likes.numbers,
        usersLiked: r.likes.usersLiked.map((l) => ({ ...l })),
      },
    })),
  }));
};
