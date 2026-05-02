
# Mục Lục Tài Liệu Thiết Kế — Property Tycoon Web

Bộ tài liệu này định nghĩa toàn bộ thiết kế, phạm vi sản phẩm và kế hoạch triển khai cho dự án **Property Tycoon Web** (phiên bản Ambitious MVP). 

Dưới đây là danh sách và tóm tắt tác dụng của từng tài liệu:

*   **[000-overview.md] - Tổng quan dự án:** Là điểm bắt đầu cho toàn bộ bộ tài liệu, giúp người đọc hiểu nhanh game này là gì, định hướng của bản MVP, các quyết định thiết kế lớn đã chốt và hướng dẫn nên đọc file nào tiếp theo để đi sâu vào từng khía cạnh,.
*   **[001-product-scope.md] - Phạm vi sản phẩm:** Xác định ranh giới của bản MVP. Tài liệu này liệt kê chi tiết những tính năng nào nằm trong phạm vi phát triển (in-scope) và những tính năng nào chắc chắn không làm trong giai đoạn này (out-of-scope) để tránh lan man,.
*   **[002-gameplay-rules.md] - Luật chơi lõi:** Định nghĩa chi tiết cách vận hành của một ván game, bao gồm vòng lặp lối chơi, thứ tự lượt đi, quy tắc tung xúc xắc, di chuyển, mua bất động sản, trả tiền thuê nhà, xây dựng, rút thẻ và hệ thống đi tù,.
*   **[003-board-design.md] - Thiết kế bàn cờ:** Giải thích quyết định sử dụng bàn cờ 40 ô, mô tả chi tiết số lượng và vị trí của các loại ô (đất thường, trạm, tiện ích, cơ hội, khí vận, v.v.), cách phân chia các nhóm bất động sản, cũng như nguyên tắc đặt tên/thiết kế chủ đề (theme) để không vi phạm bản quyền (IP),,,.
*   **[004-economy-and-debt.md] - Kinh tế & Nợ nần:** Đây là tài liệu cốt lõi tạo nên sự khác biệt của bản MVP này. Nó định nghĩa toàn bộ lớp tài chính nâng cao bao gồm: bán công trình, thế chấp tài sản, gỡ thế chấp, tính lãi suất và đặc biệt là hệ thống xử lý nợ (Debt Resolution) - cho phép người chơi xoay sở trước khi bị phá sản,,.
*   **[005-ui-ux-scope.md] - Phạm vi giao diện & Trải nghiệm:** Định nghĩa các nguyên tắc UX và danh sách các màn hình (screen), bảng điều khiển (panel), hộp thoại (modal) cần thiết cho game. Tài liệu cũng bao gồm các yêu cầu về hiệu ứng hình ảnh (animation) và âm thanh, ưu tiên sự rõ ràng thay vì phức tạp,.
*   **[006-technical-design.md] - Thiết kế Kỹ thuật:** Dành riêng cho đội ngũ Lập trình viên (Developer). File này quy định kiến trúc kỹ thuật (Tech Stack), sơ đồ luồng (State Machine), cấu trúc dữ liệu (Data Models), cơ chế Lưu/Tải (Save/Load) và đưa ra nguyên tắc bắt buộc: **tách biệt hoàn toàn Game Engine ra khỏi UI**,,.
*   **[007-testing-and-acceptance.md] - Kiểm thử & Nghiệm thu:** Đề ra chiến lược kiểm thử và các tiêu chí thành công của bản MVP. Tài liệu nhấn mạnh việc ưu tiên viết Unit Test cho Game Engine và đặt ra yêu cầu nghiệm thu khắt khe nhất là: **"Không bao giờ bị kẹt lượt" (No Stuck Turn)**,,.
*   **[008-roadmap-and-backlog.md] - Kế hoạch triển khai:** Chuyển hóa toàn bộ yêu cầu thiết kế thành kế hoạch thực thi. Tài liệu này chia lộ trình thành các giai đoạn (từ Prototype P0 đến Phase 6) và chia nhỏ công việc thành **13 Epics** quản lý các Task/Story để đội ngũ có thể bắt tay vào code ngay,,,.