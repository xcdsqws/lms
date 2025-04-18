const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // next.config.js와 .env 파일이 있는 위치를 지정합니다
  dir: "./",
})

// Jest에 적용할 커스텀 설정
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!next.config.js",
  ],
}

// createJestConfig는 next/jest가 비동기 코드를 처리할 수 있도록
// 이 파일을 내보내는 비동기 함수를 반환합니다
module.exports = createJestConfig(customJestConfig)
