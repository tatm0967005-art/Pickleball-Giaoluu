# SABECO và những người bạn — Lần 3 (Đăng ký giao lưu Pickleball)

Trang đăng ký + trang quản trị duyệt danh sách, host miễn phí trên GitHub Pages,
dữ liệu lưu trong 1 Google Sheet (qua Google Apps Script) — không cần server riêng.

## Cấu trúc

```
index.html            -> toàn bộ website (trang đăng ký + trang quản trị)
apps-script-code.gs    -> code backend, dán vào Google Apps Script
```

## Bước 1 — Tạo kho dữ liệu (Google Sheet + Apps Script)

1. Vào [sheets.google.com](https://sheets.google.com) → tạo 1 Sheet mới, đặt tên bất kỳ
   (ví dụ "DB - Pickleball SABECO Lần 3").
2. Menu **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Xóa hết code mẫu (`myFunction(){...}`), copy toàn bộ nội dung file
   `apps-script-code.gs` trong repo này vào, rồi **Lưu** (Ctrl+S).
4. Bấm **Triển khai (Deploy) → Triển khai mới (New deployment)**.
   - Chọn loại: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Bấm **Deploy**, cấp quyền khi được hỏi (chọn tài khoản Google → Advanced →
     Go to (tên project) → Allow).
5. Copy **URL Web app** hiện ra (dạng
   `https://script.google.com/macros/s/xxxxxxx/exec`) — sẽ dùng ở bước 2.

Sau khi ai đó đăng ký lần đầu, Apps Script sẽ tự tạo 2 sheet con là `Config` và
`Registrations` trong file Sheet — không cần tạo tay.

> Đổi mật khẩu quản trị mặc định `sabeco2026` ngay sau khi có người đăng ký đầu
> tiên: vào trang **Quản trị → Cấu hình giải** trên website và đổi mật khẩu mới.

## Bước 2 — Gắn URL vào website

Mở file `index.html`, tìm dòng gần đầu thẻ `<script>`:

```js
var API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Thay bằng URL bạn copy ở Bước 1, ví dụ:

```js
var API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Lưu lại file.

## Bước 3 — Đưa lên GitHub

Nếu chưa có repo:

```bash
git init
git add index.html apps-script-code.gs README.md
git commit -m "Website đăng ký giao lưu Pickleball SABECO Lần 3"
git branch -M main
git remote add origin https://github.com/<tên-github-của-bạn>/<tên-repo>.git
git push -u origin main
```

(Tạo repo trống trước tại github.com/new, KHÔNG tick "Add README" để tránh
xung đột khi push.)

## Bước 4 — Bật GitHub Pages (public link cho team)

1. Vào repo trên GitHub → **Settings → Pages**.
2. Mục "Build and deployment" → Source: **Deploy from a branch**.
3. Branch: chọn **main**, thư mục **/(root)** → **Save**.
4. Đợi khoảng 1 phút, GitHub sẽ cấp link dạng:
   `https://<tên-github-của-bạn>.github.io/<tên-repo>/`

Gửi link này cho cả team là dùng được ngay — không cần cài gì thêm.

## Cập nhật sau này

- Mỗi lần sửa `index.html` (đổi màu, đổi chữ, thêm trường...), chỉ cần
  `git add . && git commit -m "..." && git push` — GitHub Pages tự cập nhật
  sau khoảng 1 phút.
- Đổi tên giải / ngày thi đấu / mục đích / thể thức / mở-đóng đăng ký: làm
  ngay trên website ở **Quản trị → Cấu hình giải**, không cần sửa code.
- Muốn xem/sửa dữ liệu thô: mở thẳng Google Sheet đã tạo ở Bước 1, có 2 sheet
  `Config` và `Registrations`.

## Lưu ý bảo mật

- Mật khẩu quản trị được kiểm tra ở phía Apps Script (server), không chỉ ở
  trình duyệt, nên không thể bấm Duyệt/Xóa/Sửa cấu hình nếu không có mật khẩu
  đúng — kể cả khi ai đó gọi thẳng vào API.
- Vì đây là Google Sheet cá nhân đứng sau, đừng chia sẻ URL Apps Script kèm
  quyền chỉnh sửa Sheet cho người ngoài; chỉ chia sẻ link website
  (GitHub Pages) cho team đăng ký.
