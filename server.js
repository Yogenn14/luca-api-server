const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: '*'
};


// middleware
app.use(cors(corsOptions));  // Corrected order here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/profileimg', express.static('profileimg'));


// routers
const productRouter = require('./routes/productRouter');
app.use('/api/products', productRouter);

const subjectRouter = require('./routes/subjectRouter');
app.use('/api/subjects', subjectRouter);

const userRouter = require('./routes/userRouter');
app.use('/api/user', userRouter);

const sectionRouter = require('./routes/sectionRouter');
app.use('/api/sections', sectionRouter);

const markRouter = require('./routes/marksRouter');
app.use('/api/marks', markRouter);
    
app.get('/', (req, res) => {
    res.json({ message: 'hello from api' });
});


app.get('/pdf/:filename', (req, res) => {
    const { filename } = req.params;
    res.setHeader('Content-Disposition', 'inline'); // Set Content-Disposition header to "inline"
    res.sendFile(filename, { root: './pdf' }); // Serve the PDF file
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});