const express = require('express');
const connectDB = require('./config/db');
const commandeRoutes = require('./routes/CommandeRoutes');

const app = express();

connectDB();

app.use(express.json());

app.use('/commandes', commandeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Commande service running on port ${PORT}`);
    console.log('Visit http://localhost:' + PORT + '/commandes to access the commandes API');
});
