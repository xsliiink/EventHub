module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Исправлено: используем AfterEnv для корректной работы testing-library
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], 
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Внутри client/jest.config.js
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
            jsx: 'react-jsx',
            module: 'commonjs', 
            moduleResolution: 'node',
            esModuleInterop: true,
            // ОТКЛЮЧАЕМ этот флаг, чтобы он не ругался на импорты в тестах
            verbatimModuleSyntax: false, 
            }
        }],
    },
};