export const authConstants = {
  user_1: {
    login: 'Bobby',
    password: '157523485254',
    email: 'bobby@gmail.com',
  },
  login_1: {
    loginOrEmail: 'Bobby',
    password: '157523485254',
  },
  new_login_1: {
    loginOrEmail: 'Bobby',
    password: '123456789',
  },
  login_2: {
    loginOrEmail: 'Boby',
    password: '557722445555',
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
