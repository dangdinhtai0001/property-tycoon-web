import { type Card, TileType } from '../types/game';

export const CHANCE_CARDS: Card[] = [
  {
    id: 'ch-1',
    type: TileType.CHANCE,
    title: 'Tuyến Metro Mới Mở',
    description: 'Thành phố khánh thành tuyến Metro đi qua các trạm. Giá thuê tại tất cả các Bến xe tăng gấp đôi trong 3 lượt.',
    effect: { type: 'TEMP_RENT_MODIFIER', target: 'STATION', value: 2, duration: 3 }
  },
  {
    id: 'ch-2',
    type: TileType.CHANCE,
    title: 'Sốt Đất Ven Sông',
    description: 'Giới đầu tư đổ xô về khu vực ven sông. Giá thuê tại nhóm Ven Sông Cao Cấp tăng 50% trong 3 lượt.',
    effect: { type: 'TEMP_RENT_MODIFIER', target: 'GREEN', value: 1.5, duration: 3 }
  },
  {
    id: 'ch-3',
    type: TileType.CHANCE,
    title: 'Thanh Tra Xây Dựng',
    description: 'Sai phạm quy hoạch được phát hiện. Người sở hữu nhiều công trình nhất bị giảm 1 cấp xây dựng tại tài sản đắt nhất của họ.',
    effect: { type: 'ADJUST_BUILDING_LEVEL', target: 'MOST_BUILDINGS', value: -1 }
  },
  {
    id: 'ch-4',
    type: TileType.CHANCE,
    title: 'Siết Tín Dụng',
    description: 'Ngân hàng thắt chặt cho vay bất động sản. Không ai được phép giải chấp tài sản cho đến hết vòng này.',
    effect: { type: 'DISABLE_ACTION_UNTIL_ROUND_END', target: 'UNMORTGAGE' }
  },
  {
    id: 'ch-5',
    type: TileType.CHANCE,
    title: 'Nhà Thầu Giảm Giá',
    description: 'Chi phí vật liệu giảm mạnh. Lần xây dựng tiếp theo của bạn được giảm 20% chi phí.',
    effect: { type: 'TEMP_BUILD_COST_MODIFIER', value: 0.8, duration: 1 }
  },
  {
    id: 'ch-6',
    type: TileType.CHANCE,
    title: 'Khảo Sát Dự Án Mới',
    description: 'Bạn đi khảo sát thị trường. Di chuyển tới ô đất chưa có chủ gần nhất và có quyền mua nó.',
    effect: { type: 'MOVE_TO_NEAREST_UNOWNED_PROPERTY' }
  },
  {
    id: 'ch-7',
    type: TileType.CHANCE,
    title: 'Tiến đến Central Park',
    description: 'Di chuyển ngay tới Central Park Complex để tham gia sự kiện mở bán.',
    effect: { type: 'MOVE_TO_TILE', position: 43 }
  },
  {
    id: 'ch-8',
    type: TileType.CHANCE,
    title: 'Bay Đến Sân Bay',
    description: 'Có chuyến bay khẩn cấp. Tiến thẳng đến Sân Bay Nội Đô. Nếu đi qua ô Xuất phát, nhận $200.',
    effect: { type: 'MOVE_TO_TILE', position: 44 }
  },
  {
    id: 'ch-9',
    type: TileType.CHANCE,
    title: 'Thuế Chuyển Nhượng',
    description: 'Chính sách thuế mới áp dụng. Bạn phải nộp $150 tiền thuế bất động sản.',
    effect: { type: 'PAY_MONEY', value: 150 }
  },
  {
    id: 'ch-10',
    type: TileType.CHANCE,
    title: 'Lãi Suất Tăng',
    description: 'Ngân hàng trung ương tăng lãi suất điều hành. Trả $100 phí quản lý tài chính.',
    effect: { type: 'PAY_MONEY', value: 100 }
  },
  {
    id: 'ch-11',
    type: TileType.CHANCE,
    title: 'Quy Hoạch Phố Đi Bộ',
    description: 'Khu vực Phố Cổ được chuyển thành phố đi bộ. Giá thuê tại nhóm Phố Cổ tăng 30% trong 3 lượt.',
    effect: { type: 'TEMP_RENT_MODIFIER', target: 'PINK', value: 1.3, duration: 3 }
  },
  {
    id: 'ch-12',
    type: TileType.CHANCE,
    title: 'Bảo Trì Điện Nước',
    description: 'Cần nâng cấp hệ thống hạ tầng. Trả $25 cho mỗi tài sản bạn đang sở hữu.',
    effect: { type: 'PAY_PER_PROPERTY', value: 25 }
  },
  {
    id: 'ch-13',
    type: TileType.CHANCE,
    title: 'Cải Tạo Chung Cư',
    description: 'Chi phí bảo trì định kỳ cho các công trình. Trả $40 cho mỗi cấp công trình đã xây dựng.',
    effect: { type: 'PAY_PER_BUILDING', value: 40 }
  },
  {
    id: 'ch-14',
    type: TileType.CHANCE,
    title: 'Vướng Pháp Lý',
    description: 'Dự án của bạn bị đình chỉ để thanh tra. Di chuyển thẳng đến Khu Cách Ly. Không nhận tiền từ ô Xuất Phát.',
    effect: { type: 'MOVE_TO_TILE', position: 13 }
  },
  {
    id: 'ch-15',
    type: TileType.CHANCE,
    title: 'Quỹ Đầu Tư Rút Vốn',
    description: 'Thị trường biến động khiến quỹ đầu tư rút vốn đột ngột. Bạn mất $200.',
    effect: { type: 'PAY_MONEY', value: 200 }
  },
  {
    id: 'ch-16',
    type: TileType.CHANCE,
    title: 'Cổ Tức Bất Động Sản',
    description: 'Các khoản đầu tư gián tiếp mang lại lợi nhuận lớn. Nhận $150.',
    effect: { type: 'RECEIVE_MONEY', value: 150 }
  }
];

export const FORTUNE_CARDS: Card[] = [
  {
    id: 'fo-1',
    type: TileType.FORTUNE,
    title: 'Cà Phê Đối Tác',
    description: 'Một buổi gặp gỡ thành công mang lại hợp đồng môi giới nhỏ. Nhận $50.',
    effect: { type: 'RECEIVE_MONEY', value: 50 }
  },
  {
    id: 'fo-2',
    type: TileType.FORTUNE,
    title: 'Phí Vệ Sinh Khu Phố',
    description: 'Đóng góp phí vệ sinh và an ninh cho cộng đồng dân cư. Trả $15 cho mỗi tài sản sở hữu.',
    effect: { type: 'PAY_PER_PROPERTY', value: 15 }
  },
  {
    id: 'fo-3',
    type: TileType.FORTUNE,
    title: 'Môi Giới Mách Nước',
    description: 'Bạn nhận được tin nội bộ về một dự án sắp mở bán. Lần mua tài sản tiếp theo được giảm giá 10%.',
    effect: { type: 'ONE_TIME_PURCHASE_DISCOUNT', value: 0.9 }
  },
  {
    id: 'fo-4',
    type: TileType.FORTUNE,
    title: 'Đàm Phán Khéo Léo',
    description: 'Nhờ mối quan hệ tốt, bạn được chủ đất giảm 50% tiền thuê trong lần dừng chân tiếp theo.',
    effect: { type: 'ONE_TIME_RENT_DISCOUNT', value: 0.5 }
  },
  {
    id: 'fo-5',
    type: TileType.FORTUNE,
    title: 'Cộng Đồng Hỗ Trợ',
    description: 'Quỹ hỗ trợ doanh nghiệp nhỏ giải ngân. Người có ít tiền mặt nhất nhận được $100.',
    effect: { type: 'RECEIVE_MONEY', target: 'LOWEST_CASH', value: 100 }
  },
  {
    id: 'fo-6',
    type: TileType.FORTUNE,
    title: 'Bàn Chuyện Đất Cát',
    description: 'Đi uống cà phê và nghe ngóng thị trường. Tiến thêm 3 bước.',
    effect: { type: 'MOVE_STEPS', value: 3 }
  },
  {
    id: 'fo-7',
    type: TileType.FORTUNE,
    title: 'Lì Xì Đầu Năm',
    description: 'May mắn đầu năm mới. Nhận $20 từ mỗi người chơi khác (hoặc từ ngân hàng nếu chơi một mình).',
    effect: { type: 'RECEIVE_MONEY', value: 20 }
  },
  {
    id: 'fo-8',
    type: TileType.FORTUNE,
    title: 'Hoàn Thuế Thu Nhập',
    description: 'Quyết toán thuế có dư. Ngân hàng hoàn lại cho bạn $50.',
    effect: { type: 'RECEIVE_MONEY', value: 50 }
  },
  {
    id: 'fo-9',
    type: TileType.FORTUNE,
    title: 'Vi Phạm Giao Thông',
    description: 'Bị phạt vì đỗ xe sai quy định khi đi xem đất. Nộp phạt $15.',
    effect: { type: 'PAY_MONEY', value: 15 }
  },
  {
    id: 'fo-10',
    type: TileType.FORTUNE,
    title: 'Quỹ Khuyến Học',
    description: 'Đóng góp từ thiện cho quỹ khuyến học địa phương. Trả $20.',
    effect: { type: 'PAY_MONEY', value: 20 }
  },
  {
    id: 'fo-11',
    type: TileType.FORTUNE,
    title: 'Sửa Sang Sân Vườn',
    description: 'Làm đẹp cảnh quan cho tài sản của bạn. Chi phí nhân công là $30.',
    effect: { type: 'PAY_MONEY', value: 30 }
  },
  {
    id: 'fo-12',
    type: TileType.FORTUNE,
    title: 'Hàng Xóm Tặng Quà',
    description: 'Mối quan hệ láng giềng hữu hảo. Nhận quà trị giá $15.',
    effect: { type: 'RECEIVE_MONEY', value: 15 }
  },
  {
    id: 'fo-13',
    type: TileType.FORTUNE,
    title: 'Trúng Giải Khuyến Khích',
    description: 'Trúng giải nhỏ từ chương trình bốc thăm may mắn của trung tâm thương mại. Nhận $50.',
    effect: { type: 'RECEIVE_MONEY', value: 50 }
  },
  {
    id: 'fo-14',
    type: TileType.FORTUNE,
    title: 'Lùi Lại Suy Ngẫm',
    description: 'Thị trường chững lại, bạn cần thời gian quan sát. Lùi lại 3 bước.',
    effect: { type: 'MOVE_STEPS', value: -3 }
  },
  {
    id: 'fo-15',
    type: TileType.FORTUNE,
    title: 'Đi Nghỉ Dưỡng',
    description: 'Nạp lại năng lượng sau những ngày làm việc vất vả. Di chuyển tới Trạm Dừng Chân.',
    effect: { type: 'MOVE_TO_TILE', position: 24 }
  },
  {
    id: 'fo-16',
    type: TileType.FORTUNE,
    title: 'Hỗ Trợ Sửa Chữa',
    description: 'Nhận gói hỗ trợ bảo trì thiết bị từ nhà cung cấp dịch vụ. Nhận $30.',
    effect: { type: 'RECEIVE_MONEY', value: 30 }
  }
];
