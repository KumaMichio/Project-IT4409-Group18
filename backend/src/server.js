require('dotenv').config();
const createExpressApp = require('./app');

const app = createExpressApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
