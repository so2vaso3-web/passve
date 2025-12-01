"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Pass Vé Phim là gì?",
      answer: "Pass Vé Phim là nền tảng mua bán, sang nhượng vé xem phim, vé concert và vé sự kiện uy tín tại Việt Nam. Chúng tôi cung cấp hệ thống escrow tự động để đảm bảo giao dịch an toàn cho cả người mua và người bán.",
    },
    {
      question: "Làm thế nào để mua vé?",
      answer: "Bạn chỉ cần tìm vé trên trang chủ, xem chi tiết, chat với người bán nếu cần, sau đó click 'Mua ngay' và thanh toán. Tiền sẽ được giữ trong hệ thống escrow cho đến khi bạn nhận và xác nhận vé.",
    },
    {
      question: "Làm thế nào để bán vé?",
      answer: "Đăng nhập vào tài khoản, click 'Đăng bán vé', điền đầy đủ thông tin về vé (tên phim/sự kiện, ngày giờ, địa điểm, giá...), upload ảnh vé và đăng tin. Khi có người mua, bạn sẽ nhận được thông báo.",
    },
    {
      question: "Hệ thống escrow hoạt động như thế nào?",
      answer: "Khi người mua thanh toán, tiền được giữ trong tài khoản escrow. Người bán gửi vé cho người mua. Sau khi người mua kiểm tra và xác nhận nhận vé, tiền mới được chuyển cho người bán. Điều này bảo vệ cả hai bên khỏi lừa đảo.",
    },
    {
      question: "Tôi có thể hủy giao dịch không?",
      answer: "Sau khi thanh toán, bạn có thể hủy giao dịch trong vòng 1 giờ đầu. Sau đó, nếu muốn hủy, bạn cần thỏa thuận với người bán hoặc liên hệ hỗ trợ nếu có vấn đề với vé (vé giả, sai thông tin...).",
    },
    {
      question: "Làm sao để nạp tiền vào ví?",
      answer: "Vào trang 'Tài khoản' → 'Ví', chọn số tiền muốn nạp và phương thức thanh toán (thẻ ngân hàng, ví điện tử...). Thanh toán và tiền sẽ được cộng vào ví ngay lập tức.",
    },
    {
      question: "Làm sao để rút tiền từ ví?",
      answer: "Vào 'Ví' → 'Rút tiền', điền thông tin tài khoản ngân hàng và số tiền muốn rút. Tiền sẽ được chuyển vào tài khoản của bạn trong vòng 1-3 ngày làm việc.",
    },
    {
      question: "Phí dịch vụ là bao nhiêu?",
      answer: "Hiện tại, chúng tôi thu phí 5% từ người bán khi giao dịch thành công. Người mua không phải trả phí. Phí này được tính tự động khi giao dịch hoàn tất.",
    },
    {
      question: "Làm sao để đảm bảo vé là thật?",
      answer: "Chúng tôi khuyến khích bạn: (1) Yêu cầu người bán gửi ảnh vé rõ ràng, (2) Kiểm tra kỹ thông tin trên vé, (3) Chat với người bán để hỏi thêm, (4) Chỉ giao dịch qua hệ thống escrow. Nếu phát hiện vé giả, báo cáo ngay cho chúng tôi.",
    },
    {
      question: "Tôi bị lừa đảo, phải làm gì?",
      answer: "Nếu bạn phát hiện bị lừa đảo (vé giả, không nhận được vé...), hãy: (1) Không xác nhận nhận vé, (2) Báo cáo ngay qua trang Liên hệ hoặc email support@passvephim.vn, (3) Cung cấp bằng chứng (ảnh, chat...). Chúng tôi sẽ điều tra và hoàn tiền cho bạn nếu đúng.",
    },
    {
      question: "Tôi có thể đăng bán vé đã sử dụng không?",
      answer: "Không. Bạn chỉ được đăng bán vé còn hiệu lực và chưa được sử dụng. Đăng bán vé đã sử dụng hoặc vé giả sẽ bị khóa tài khoản vĩnh viễn.",
    },
    {
      question: "Làm sao để liên hệ hỗ trợ?",
      answer: "Bạn có thể liên hệ với chúng tôi qua: (1) Trang Liên hệ trên website, (2) Email: support@passvephim.vn, (3) Hotline: 1900 1234 (Thứ 2 - Chủ nhật: 8:00 - 22:00), (4) Chat trực tiếp trên website.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Câu hỏi thường gặp (FAQ)
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-dark-card border-dark-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between hover:bg-dark-800 transition-colors text-left"
              >
                <h2 className="text-lg font-heading font-semibold text-dark-text pr-4">
                  {faq.question}
                </h2>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-dark-text2 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark-text2 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0 border-t border-dark-border">
                  <p className="text-dark-text2 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-dark-card border-dark-border">
          <h2 className="text-xl font-heading font-bold text-dark-text mb-4">
            Không tìm thấy câu trả lời?
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
              <a href="/help" className="text-neon-green hover:underline">
                Hướng dẫn
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

