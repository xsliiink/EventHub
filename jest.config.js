module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    TextEncoder: require('util').TextEncoder,
    TextDecoder: require('util').TextDecoder,
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Это заставит Jest всегда брать один и тот же React
    '^react$': '<rootDir>/client/node_modules/react',
    '^react-dom$': '<rootDir>/client/node_modules/react-dom',
  },
  // Добавляем пути, где искать модули
  moduleDirectories: ['node_modules', 'client/node_modules'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};