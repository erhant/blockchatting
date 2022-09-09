module.exports = {
  ...require('gts/.prettierrc.json'),
  printWidth: 120,
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
