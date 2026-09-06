module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `void promise` explicitly marks intentional fire-and-forget UI work.
    'no-void': 'off',
  },
};
