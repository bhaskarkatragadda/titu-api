const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dbConn = require('./config/database');
const middlewares = require('./middleware/errorHandler');
const user = require('./routes/user');
const tasks = require('./routes/tasks');
require('dotenv').config();

// Initializing database connecton
dbConn();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TituTasks',
  });
});

app.use('/api/user', user);
app.use('/api/tasks', tasks);
app.use(middlewares.notFound);

app.use(middlewares.errorHandler);

const port = process.env.PORT || 5007;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening at http://localhost:${port}`);
});
