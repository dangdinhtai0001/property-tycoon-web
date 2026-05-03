# Troubleshoot: Phaser Bridge Subscription Bug

## Triệu chứng (Symptoms)
- Sau khi đổ xúc xắc, quân cờ (Token) không di chuyển trên bàn cờ Phaser.
- Không có bất kỳ log di chuyển nào xuất hiện mặc dù trạng thái Game (Zustand) đã thay đổi.
- Bàn cờ Phaser vẫn hiển thị nhưng ở trạng thái "đóng băng" về mặt dữ liệu đồng bộ.

## Nguyên nhân (Root Cause)
Lỗi nằm ở việc sử dụng sai cú pháp đăng ký theo dõi (subscription) của thư viện **Zustand** trong file `src/phaser/bridge/PhaserBridge.ts`.

Cụ thể, mã nguồn ban đầu sử dụng:
```typescript
this.unsubscribe = useGameStore.subscribe(
  (state) => state.state, // Selector
  (gameState) => {        // Callback
    this.updatePhaser(gameState);
  }
);
```

Cú pháp này chỉ hợp lệ khi Store được bao bọc bởi middleware `subscribeWithSelector`. Tuy nhiên, `useGameStore.ts` của dự án đang sử dụng Store tiêu chuẩn. Trong phiên bản Zustand 4+, hàm `subscribe` mặc định chỉ nhận duy nhất một tham số là hàm callback nhận vào toàn bộ `state` mới.

Do đó, tham số thứ hai (hàm cập nhật Phaser) bị bỏ qua hoàn toàn, khiến Bridge không bao giờ nhận được thông báo thay đổi trạng thái.

## Cách khắc phục (Resolution)
Chuyển về sử dụng cú pháp `subscribe` tiêu chuẩn:

```typescript
this.unsubscribe = useGameStore.subscribe(
  (state) => {
    this.updatePhaser(state.state);
  }
);
```

## Lưu ý (Notes)
- Nếu sau này muốn tối ưu hiệu năng bằng cách chỉ lắng nghe thay đổi của một phần nhỏ trong store (selector), cần thêm middleware `subscribeWithSelector` vào `src/app/store/useGameStore.ts`.
- Đảm bảo gọi `this.unsubscribe()` trong hàm `destroy()` của Bridge để tránh rò rỉ bộ nhớ (memory leak).
