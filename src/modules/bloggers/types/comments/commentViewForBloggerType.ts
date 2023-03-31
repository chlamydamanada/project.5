export type CommentViewForBloggerType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};
