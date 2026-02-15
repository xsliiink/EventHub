const {pathsToModuleNameMapper} = require('ts-jest');
const { compilerOptions } = require('./tsconfig.app.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',


  //using AfterEnv fot the correct work of testingLibrary
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], 
  
  
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(compilerOptions.paths,{
      prefix: '<rootDir>/'
    }),
  },


    transform: {
      '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
      },
    ],
    },
};