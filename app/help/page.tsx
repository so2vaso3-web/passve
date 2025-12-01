"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp, ShoppingCart, Upload, MessageCircle, Shield, CreditCard, HelpCircle } from "lucide-react";

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: "getting-started",
      title: "Bắt đầu sử dụng",
      icon: <HelpCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">1. Đăng ký tài khoản</h3>
            <p className="text-dark-text2 text-sm">
              Click vào nút "Đăng ký" ở góc trên bên phải, điền thông tin hoặc đăng nhập bằng Google/Facebook.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">2. Xác thực tài khoản</h3>
            <p className="text-dark-text2 text-sm">
              Sau khi đăng ký, bạn sẽ nhận được email xác thực. Click vào link trong email để kích hoạt tài khoản.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">3. Nạp tiền vào ví</h3>
            <p className="text-dark-text2 text-sm">
              Vào trang "Tài khoản" → "Ví", chọn phương thức thanh toán và nạp tiền. Tiền sẽ được cộng vào ví ngay sau khi thanh toán thành công.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "buying",
      title: "Cách mua vé",
      icon: <ShoppingCart className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 1: Tìm vé</h3>
            <p className="text-dark-text2 text-sm">
              Duyệt trang chủ hoặc sử dụng thanh tìm kiếm để tìm vé bạn muốn mua. Bạn có thể lọc theo loại phim, ngày, giá...
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 2: Xem chi tiết</h3>
            <p className="text-dark-text2 text-sm">
              Click vào vé để xem thông tin chi tiết: ngày giờ, địa điểm, giá, thông tin người bán...
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 3: Chat với người bán</h3>
            <p className="text-dark-text2 text-sm">
              Click "Chat với người bán" để trao đổi thêm thông tin, đặt câu hỏi về vé.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 4: Thanh toán</h3>
            <p className="text-dark-text2 text-sm">
              Click "Mua ngay", kiểm tra thông tin và thanh toán. Tiền sẽ được giữ trong hệ thống escrow cho đến khi bạn nhận vé.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 5: Nhận vé và xác nhận</h3>
            <p className="text-dark-text2 text-sm">
              Sau khi nhận vé từ người bán, kiểm tra kỹ và click "Xác nhận nhận vé". Tiền sẽ được chuyển cho người bán.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "selling",
      title: "Cách bán vé",
      icon: <Upload className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 1: Đăng nhập</h3>
            <p className="text-dark-text2 text-sm">
              Đăng nhập vào tài khoản của bạn, click "Đăng bán vé" ở menu hoặc header.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 2: Điền thông tin vé</h3>
            <p className="text-dark-text2 text-sm">
              Điền đầy đủ thông tin: loại vé, tên phim/sự kiện, ngày giờ, địa điểm, số lượng, giá bán, mô tả...
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 3: Upload ảnh vé</h3>
            <p className="text-dark-text2 text-sm">
              Upload ảnh vé (có thể che một phần thông tin nhạy cảm). Ảnh rõ ràng sẽ giúp vé bán nhanh hơn.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 4: Đăng tin</h3>
            <p className="text-dark-text2 text-sm">
              Kiểm tra lại thông tin và click "Đăng tin". Vé của bạn sẽ xuất hiện trên trang chủ.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Bước 5: Giao dịch</h3>
            <p className="text-dark-text2 text-sm">
              Khi có người mua, bạn sẽ nhận được thông báo. Chat với người mua, sau khi họ thanh toán, bạn gửi vé cho họ. Sau khi họ xác nhận nhận vé, tiền sẽ được chuyển vào ví của bạn.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "chat",
      title: "Hệ thống Chat",
      icon: <MessageCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Cách sử dụng Chat</h3>
            <p className="text-dark-text2 text-sm">
              Click vào biểu tượng chat ở header để mở sidebar chat. Bạn sẽ thấy danh sách các cuộc trò chuyện với người mua/bán.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Chat với người bán</h3>
            <p className="text-dark-text2 text-sm">
              Khi xem chi tiết vé, click "Chat với người bán" để bắt đầu trò chuyện. Bạn có thể hỏi về vé, thương lượng giá...
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Thông báo tin nhắn mới</h3>
            <p className="text-dark-text2 text-sm">
              Khi có tin nhắn mới, bạn sẽ thấy số thông báo màu đỏ trên biểu tượng chat. Click vào để xem tin nhắn.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "payment",
      title: "Thanh toán và Ví",
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Nạp tiền vào ví</h3>
            <p className="text-dark-text2 text-sm">
              Vào "Tài khoản" → "Ví", chọn số tiền và phương thức thanh toán (thẻ ngân hàng, ví điện tử...). Thanh toán và tiền sẽ được cộng vào ví ngay lập tức.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Hệ thống Escrow</h3>
            <p className="text-dark-text2 text-sm">
              Khi mua vé, tiền của bạn được giữ trong hệ thống escrow. Chỉ khi bạn xác nhận nhận vé, tiền mới được chuyển cho người bán. Điều này bảo vệ bạn khỏi lừa đảo.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Rút tiền</h3>
            <p className="text-dark-text2 text-sm">
              Sau khi bán vé và nhận tiền, bạn có thể rút tiền về tài khoản ngân hàng. Vào "Ví" → "Rút tiền", điền thông tin và số tiền muốn rút.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "safety",
      title: "An toàn và Bảo mật",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Kiểm tra vé trước khi mua</h3>
            <p className="text-dark-text2 text-sm">
              Luôn yêu cầu người bán gửi ảnh vé rõ ràng, kiểm tra ngày giờ, địa điểm, loại vé... Nếu có nghi ngờ, hãy hỏi thêm hoặc không mua.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Không giao dịch ngoài hệ thống</h3>
            <p className="text-dark-text2 text-sm">
              Không bao giờ chuyển tiền trực tiếp cho người bán ngoài hệ thống. Chỉ giao dịch qua Pass Vé Phim để được bảo vệ bởi hệ thống escrow.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Báo cáo lừa đảo</h3>
            <p className="text-dark-text2 text-sm">
              Nếu phát hiện vé giả, người bán lừa đảo, hoặc bất kỳ hành vi đáng ngờ nào, hãy báo cáo ngay cho chúng tôi qua trang Liên hệ hoặc email support@passvephim.vn.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Hướng dẫn sử dụng
        </h1>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="bg-dark-card border-dark-border overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-dark-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-neon-green">{section.icon}</div>
                  <h2 className="text-xl font-heading font-bold text-dark-text">
                    {section.title}
                  </h2>
                </div>
                {openSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-dark-text2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark-text2" />
                )}
              </button>
              {openSection === section.id && (
                <div className="px-6 pb-6 pt-0 border-t border-dark-border">
                  {section.content}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-dark-card border-dark-border">
          <h2 className="text-xl font-heading font-bold text-dark-text mb-4">
            Cần hỗ trợ thêm?
          </h2>
          <p className="text-dark-text2 mb-4">
            Nếu bạn vẫn còn thắc mắc, vui lòng liên hệ với chúng tôi:
          </p>
          <div className="space-y-2 text-dark-text2">
            <p>📧 Email: support@passvephim.vn</p>
            <p>📞 Hotline: 1900 1234</p>
            <p>
              💬 Hoặc truy cập{" "}
              <a href="/contact" className="text-neon-green hover:underline">
                trang Liên hệ
              </a>{" "}
              hoặc{" "}
              <a href="/faq" className="text-neon-green hover:underline">
                FAQ
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

