export type CreateBanStatusByBloggerType = {
  bloggerId: string;
  blogId: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
  userInfo: {
    userId: string;
    userLogin: string;
  };
};
