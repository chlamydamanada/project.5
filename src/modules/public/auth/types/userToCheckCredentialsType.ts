export type UserToCheckCredentialsType = {
  id: string;
  email: string;
  login: string;
  passwordHash: string;
  createdAt: string;
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
};
