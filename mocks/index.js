const mocks = {
  firstUser: {
    email: 'svyaca@gmail.com',
    username: 'sancar22',
    password: 'betterbehashed',
  },
  secondUser: {
    email: 'santiagoyacaman@uninorte.edu.co',
    username: 'sancar100',
    password: 'betterbehashedtoo',
  },
  userOnlyEmail: {
    email: 'whatever@gmail.com',
  },
  userOnlyPassword: {
    password: '123456',
  },
  userOnlyUsername: {
    username: 'hey',
  },
  userLoginNotExist: {
    email: 'idonotexist@gmail.com',
    password: 'heyidontexist',
  },
};

module.exports = {
  mocks,
};
