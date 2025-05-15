const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// 中間件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 讀取資料庫（JSON 檔案）
const getLeftoverItems = () => {
  try {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveLeftoverItems = (items) => {
  fs.writeFileSync('data.json', JSON.stringify(items, null, 2));
};

// 首頁
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 新增剩食
app.post('/add', (req, res) => {
  const { type, quantity } = req.body;
  const leftoverItems = getLeftoverItems();
  leftoverItems.push({
    id: Date.now().toString(),
    type,
    initial: parseInt(quantity),
    remaining: parseInt(quantity),
  });
  saveLeftoverItems(leftoverItems);
  res.redirect('/');
});

// 領取剩食
app.post('/pickup', (req, res) => {
  const { id, pickupQuantity } = req.body;
  const leftoverItems = getLeftoverItems();
  const item = leftoverItems.find(i => i.id === id);
  if (item) {
    item.remaining -= parseInt(pickupQuantity);
    if (item.remaining < 0) item.remaining = 0;
  }
  saveLeftoverItems(leftoverItems);
  res.redirect('/');
});

// 提供剩食列表 JSON
app.get('/data', (req, res) => {
  const leftoverItems = getLeftoverItems();
  res.json(leftoverItems);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
