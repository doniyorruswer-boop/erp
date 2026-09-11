module.exports = {
  'frontend/src/**/*.{js,ts,vue}': (filenames) => [
    `npm --prefix frontend exec eslint -- --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
  'backend/src/**/*.ts': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
  '*.{json,md,yml,yaml}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
};
