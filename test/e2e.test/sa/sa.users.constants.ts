export const saUsersConstants = {
  users_default: {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: [],
  },
  banInfo_default: {
    banDate: null,
    banReason: null,
    isBanned: false,
  },
  validUser_1: {
    login: 'Kate',
    password: '1234567',
    email: 'kate@gmail.com',
  },
  validUser_2: {
    login: 'Sam',
    password: '2345678',
    email: 'sam@gmail.com',
  },
  validUser_3: {
    login: 'Bob',
    password: '3456789',
    email: 'bob@gmail.com',
  },
  validUser_4: {
    login: 'Ted',
    password: '4567891',
    email: 'ted@gmail.com',
  },
  validUser_5: {
    login: 'Ann',
    password: '5678912',
    email: 'ann@gmail.com',
  },

  invalidUser_login: {
    login: 1234567,
    password: 'valid string',
    email: 'valid@gmail.com',
  },
  invalidUser_email: {
    login: 'Ann',
    password: '5678912',
    email: 'string',
  },
  invalidUser_password: {
    login: 'Ann',
    password: true,
    email: 'valid@gmail.com',
  },
};
