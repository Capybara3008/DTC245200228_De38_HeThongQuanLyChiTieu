const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres_db',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'expense_user',
    password: process.env.DB_PASSWORD || 'StrongPassword@2026!',
    database: process.env.DB_NAME || 'expense_db',
});

// Tự động khởi tạo bảng và dữ liệu mẫu khi chạy container
async function initDB() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        const { rows } = await pool.query('SELECT COUNT(*) FROM transactions');
        if (parseInt(rows[0].count) === 0) {
            await pool.query(`
        INSERT INTO categories (name, type) VALUES 
        ('Ăn uống', 'expense'), ('Di chuyển', 'expense'), ('Lương tháng', 'income');
        INSERT INTO transactions (title, amount, type, category) VALUES 
        ('Nhận lương tháng 10', 15000000, 'income', 'Lương tháng'),
        ('Ăn trưa sinh viên', 45000, 'expense', 'Ăn uống'),
        ('Đổ xăng xe máy', 70000, 'expense', 'Di chuyển');
      `);
            console.log('Đã khởi tạo dữ liệu mẫu vào PostgreSQL thành công!');
        }
    } catch (err) {
        console.error('Đang chờ PostgreSQL khởi động...', err.message);
        setTimeout(initDB, 3000);
    }
}
initDB();

// API kiểm tra trạng thái kết nối DB và lấy danh sách giao dịch
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as time, (SELECT COUNT(*) FROM transactions) as total_transactions');
        res.json({ status: 'OK', db_connected: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', db_connected: false, error: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    const { title, amount, type, category } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (title, amount, type, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, amount, type || 'expense', category || 'Khác']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Expense Tracker Server đang chạy tại port ${PORT}`);
});