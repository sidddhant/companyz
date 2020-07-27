const express = require('express');
const errorController = require('./controllers/error');
const jobPartRoutes = require('./routes/companyZ');
var cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(jobPartRoutes);

app.use(errorController.get404);

app.listen(3000);
