# Drone Delivery System - Backend API

## Mô tả
Backend API cho hệ thống giao hàng bằng drone. Xây dựng bằng Node.js, Express.js và MongoDB.

## Cấu trúc thư mục
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── models/          # Database models
│   │   ├── Drone.js
│   │   ├── Delivery.js
│   │   └── User.js
│   ├── controllers/     # Business logic
│   │   ├── droneController.js
│   │   └── deliveryController.js
│   ├── routes/          # API routes
│   │   └── index.js
│   └── middleware/      # Express middleware
│       └── errorHandler.js
├── server.js            # Main entry point
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy server (development)
```bash
npm run dev
```

### 3. Chạy server (production)
```bash
npm start
```

## API Endpoints

### Drones
- `GET /api/drones` - Lấy tất cả drone
- `GET /api/drones/:id` - Lấy drone theo ID
- `POST /api/drones` - Tạo drone mới
- `PUT /api/drones/:id` - Cập nhật drone
- `DELETE /api/drones/:id` - Xóa drone

### Deliveries
- `GET /api/deliveries` - Lấy tất cả giao hàng
- `GET /api/deliveries/:id` - Lấy giao hàng theo ID
- `POST /api/deliveries` - Tạo giao hàng mới
- `PUT /api/deliveries/:id` - Cập nhật giao hàng
- `DELETE /api/deliveries/:id` - Xóa giao hàng

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## Biến môi trường
```
PORT=5000
NODE_ENV=development
MONGODB_URL=mongodb://root:password@mongo:27017/drone_system?authSource=admin
```

## Chạy với Docker
Backend sẽ chạy cùng MongoDB qua docker-compose.yaml trong thư mục gốc.

```bash
docker-compose up
```

## Dependencies chính
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables
- **nodemon** - Auto reload (dev)
