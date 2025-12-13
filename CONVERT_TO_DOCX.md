# Hướng dẫn chuyển đổi Markdown sang DOCX

## Cách 1: Sử dụng Python Script (Khuyến nghị)

### Bước 1: Cài đặt thư viện
```bash
pip install python-docx
```

### Bước 2: Chạy script
```bash
python convert_to_docx.py
```

File `API_ENDPOINTS_DOCUMENTATION.docx` sẽ được tạo tự động.

---

## Cách 2: Sử dụng Microsoft Word

1. Mở Microsoft Word
2. File → Open → Chọn file `API_ENDPOINTS_DOCUMENTATION.md`
3. Word sẽ tự động chuyển đổi markdown sang format Word
4. File → Save As → Chọn định dạng `.docx`

---

## Cách 3: Sử dụng công cụ online

1. Truy cập: https://www.markdowntoword.com/
2. Upload file `API_ENDPOINTS_DOCUMENTATION.md`
3. Download file `.docx`

---

## Cách 4: Sử dụng Pandoc (Command line)

### Cài đặt Pandoc
- Windows: https://pandoc.org/installing.html
- Hoặc: `choco install pandoc`

### Chạy lệnh
```bash
pandoc API_ENDPOINTS_DOCUMENTATION.md -o API_ENDPOINTS_DOCUMENTATION.docx
```

---

## File đã có sẵn

File `API_ENDPOINTS_DOCUMENTATION.md` đã được tạo với đầy đủ:
- ✅ Tất cả API endpoints
- ✅ Mô tả chi tiết
- ✅ Request/Response examples
- ✅ Authentication requirements
- ✅ Error handling

Bạn chỉ cần chuyển đổi sang DOCX bằng một trong các cách trên.

