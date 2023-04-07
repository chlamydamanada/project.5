export type UserToCheckCredentialsType = {
  id: string;
  email: string;
  login: string;
  passwordHash: string;
  banInfo: {
    isBanned: boolean;
  };
};
