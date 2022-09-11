module.exports = {
  ...require('gts/.prettierrc.json'),
  printWidth: 120,
  // Solidity Formatting
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
