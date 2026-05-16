const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  console.log(`[SERVER] Serving: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log('===========================================');
  console.log('Open http://localhost:' + PORT + ' in your browser');
  console.log('Press Ctrl+C to stop');
});