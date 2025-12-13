# Phân tích cấu trúc code và sắp xếp lại

## Vấn đề hiện tại

### 1. File trùng lặp
- `middlewares/authMiddleware.js` và `middlewares/auth.middleware.js` - Cả hai đều xử lý authentication
- `middlewares/errorHandler.js` và `middlewares/error.middleware.js` - Cả hai đều xử lý errors

### 2. File không đúng vị trí
- `lib/users.js` - Nên ở trong `repositories/` hoặc xóa nếu không dùng

### 3. Routes chưa được mount đầy đủ
- `app.js` chỉ mount `auth.routes`
- Cần mount thêm: `recommendationRoutes`, `revenueRoutes`, `systemRoutes`

## Giải pháp

### 1. Sắp xếp lại Middlewares

**Giữ lại:**
- `middlewares/auth.middleware.js` - Dùng cho auth routes (đã có tests)
- `middlewares/authMiddleware.js` - Dùng cho các routes khác (có `requireRole`)
- `middlewares/error.middleware.js` - Dùng chính (đã có tests)
- `middlewares/role.middleware.js` - Mới tạo theo code_structure.txt

**Xóa hoặc merge:**
- `middlewares/errorHandler.js` - Có thể xóa nếu không dùng

### 2. Cấu trúc file theo code_structure.txt

#### Backend đã có:
```
✅ src/app.js
✅ src/server.js
✅ src/config/db.js
✅ src/config/env.js
✅ src/config/logger.js
✅ src/routes/auth.routes.js
✅ src/routes/recommendationRoutes.js (cần đổi tên thành recommendation.routes.js)
✅ src/routes/revenueRoutes.js (cần đổi tên thành revenue.routes.js)
✅ src/routes/systemRoutes.js (cần đổi tên thành system.routes.js)
✅ src/routes/index.js (cần cập nhật)
✅ src/controllers/auth.controller.js
✅ src/controllers/recommendationController.js (cần đổi tên thành recommendation.controller.js)
✅ src/controllers/revenueController.js (cần đổi tên thành revenue.controller.js)
✅ src/controllers/systemController.js (cần đổi tên thành system.controller.js)
✅ src/services/auth.service.js
✅ src/services/recommendationService.js (cần đổi tên thành recommendation.service.js)
✅ src/services/revenueService.js (cần đổi tên thành revenue.service.js)
✅ src/services/systemService.js (cần đổi tên thành system.service.js)
✅ src/services/logService.js (cần đổi tên thành log.service.js)
✅ src/repositories/user.repository.js
✅ src/models/recommendationFeedbackModel.js (cần đổi tên thành recommendationFeedback.model.js)
✅ src/models/revenueModel.js (cần đổi tên thành revenue.model.js)
✅ src/models/systemModel.js (cần đổi tên thành system.model.js)
✅ src/models/logModel.js (cần đổi tên thành log.model.js)
✅ src/middlewares/auth.middleware.js
✅ src/middlewares/authMiddleware.js (cần đổi tên thành role.middleware.js hoặc merge)
✅ src/middlewares/error.middleware.js
✅ src/utils/jwt.js
✅ src/utils/password.js
✅ src/utils/AppError.js
✅ src/utils/response.js
```

#### Frontend đã có:
```
✅ src/app/layout.tsx
✅ src/app/page.tsx
✅ src/app/auth/login/page.tsx
✅ src/app/auth/register/page.tsx
✅ src/app/recomendations/page.tsx (cần đổi tên thành recommendations)
✅ src/app/admin/revenue/page.tsx
✅ src/app/admin/system/page.tsx
✅ src/app/instructor/revenue/page.tsx
✅ src/components/layout/Navbar.tsx
✅ src/components/common/Button.tsx
✅ src/components/forms/TextInput.tsx
✅ src/components/forms/Select.tsx
✅ src/components/RecommendationCard.tsx
✅ src/lib/apiClient.ts
✅ src/lib/auth.ts
✅ src/lib/socketClient.ts
✅ src/lib/api.ts
✅ src/hooks/useAuth.ts
```

## Hành động cần thực hiện

### 1. Đổi tên file để tuân theo convention
- Routes: `*Routes.js` → `*.routes.js`
- Controllers: `*Controller.js` → `*.controller.js`
- Services: `*Service.js` → `*.service.js`
- Models: `*Model.js` → `*.model.js`

### 2. Cập nhật imports
- Cập nhật tất cả imports sau khi đổi tên file

### 3. Mount routes trong app.js
- Đã cập nhật trong app.js

### 4. Tạo routes/index.js
- Combine tất cả routers

### 5. Xóa file không cần thiết
- `lib/users.js` (nếu không dùng)
- `middlewares/errorHandler.js` (nếu không dùng)

## Tính năng đã triển khai

Xem file `IMPLEMENTED_FEATURES.md` để biết chi tiết.

