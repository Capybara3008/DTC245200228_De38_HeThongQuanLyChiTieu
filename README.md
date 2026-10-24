# Đề 38: Hệ thống Quản lý Chi tiêu (Expense Tracker)
- **Sinh viên thực hiện:** Hà Hồng Minh
- **Mã số sinh viên:** DTC245200228

## 1. Kiến trúc hệ thống
- **Ứng dụng Web:** Node.js (Express) + HTML/CSS/JS Quản lý chi tiêu cá nhân/gia đình.
- **Cơ sở dữ liệu:** PostgreSQL 15 + pgAdmin 4.
- **Reverse Proxy:** Nginx (Cấu hình HTTPS Self-Signed SSL + Security Headers).
- **Giám sát (Monitoring):** Prometheus + Grafana + cAdvisor + Nginx Exporter + Postgres Exporter.
- **Quản lý Log tập trung:** Loki + Promtail + Truy vấn LogQL.

## 2. Hướng dẫn khởi chạy hệ thống
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose up -d --build