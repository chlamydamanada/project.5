export const authConstants = {
  user_1: {
    login: 'Bobby',
    password: '157523485254',
    email: 'bobby@gmail.com',
  },
  user_2: {
    login: 'Emily',
    password: '157523485254',
    email: 'emily@gmail.com',
  },
  user_3: {
    login: 'Liam',
    password: '157523485254',
    email: 'liam@gmail.com',
  },
  user_4: {
    login: 'Sophia',
    password: '157523485254',
    email: 'sophia@gmail.com',
  },
  user_5: {
    login: 'Ethan',
    password: '157523485254',
    email: 'ethan@gmail.com',
  },
  user_6: {
    login: 'Olivia',
    password: '157523485254',
    email: 'olivia@gmail.com',
  },
  login_1: {
    loginOrEmail: 'Bobby',
    password: '157523485254',
  },

  login_2: {
    loginOrEmail: 'Emily',
    password: '157523485254',
  },
  login_3: {
    loginOrEmail: 'Liam',
    password: '157523485254',
  },
  login_4: {
    loginOrEmail: 'Sophia',
    password: '157523485254',
  },
  login_5: {
    loginOrEmail: 'Ethan',
    password: '157523485254',
  },
  login_6: {
    loginOrEmail: 'Olivia',
    password: '157523485254',
  },
  new_login_1: {
    loginOrEmail: 'Bobby',
    password: '123456789',
  },
  invalid_user_login: {
    login: true,
    password: '1111111111',
    email: 'valid@gmail.com',
  },
  invalid_user_email: {
    login: 'validLogin',
    password: '157523485254',
    email: 'Some string',
  },
  invalid_user_password: {
    login: 'validLogin',
    password: 1111111111,
    email: 'valid@gmail.com',
  },
  invalid_email: {
    email: 'Some string',
  },
  email_1: {
    email: 'bobby@gmail.com',
  },
  invalid_code_1: {
    code: '111a11b1-11c1-1111-1111-d1e1ab11c111',
  },
  invalid_login_loginOrEmail: {
    loginOrEmail: true,
    password: '157523485254',
  },
  invalid_login_password: {
    loginOrEmail: 'Bobby',
    password: 157523485254,
  },
  invalid_recovery_code: {
    newPassword: '123456789',
    recoveryCode: '111a11b1-11c1-1111-1111-d1e1ab11c111',
  },
};
