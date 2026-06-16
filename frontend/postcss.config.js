// Fix #12: Use ES module export default syntax.
// CommonJS module.exports breaks when package.json has "type": "module".
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
