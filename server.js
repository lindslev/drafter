import express from 'express';

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

import Sequelize from 'sequelize';

const sequelize = new Sequelize('postgres://localhost:5432/drafter');

// const Kappa = sequelize.define('kappa', {
//   topQak: {
//     type: Sequelize.STRING,
//     field: 'top_qak'
//   }
// }, {
//   freezeTableName: true
// });
//
// Kappa.sync({force: true}).then(function () {
//   return Kappa.create({
//     firstName: 'ProTag',
//   });
// });
//
// Kappa.findOne().then(function (kap) {
//     console.log('MEOW', kap.get('firstName'));
// });

app.listen(3000);
