import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Giới thiệu - Pass Vé Phim",
  description: "Tìm hiểu về Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Giới thiệu
        </h1>

        <Card className="p-8 space-y-6 bg-dark-card border-dark-border">
          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              Về Pass Vé Phim
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Pass Vé Phim là nền tảng mua bán, sang nhượng vé xem phim, vé concert và vé sự kiện 
              uy tín hàng đầu tại Việt Nam. Chúng tôi cung cấp một không gian an toàn và minh bạch 
              để người dùng có thể giao dịch vé một cách dễ dàng và đáng tin cậy.
            </p>
            <p className="text-dark-text2 leading-relaxed">
              Với hệ thống escrow tự động, chúng tôi đảm bảo giao dịch được thực hiện một cách 
              an toàn, bảo vệ quyền lợi của cả người mua và người bán.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              Sứ mệnh
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Chúng tôi cam kết mang đến trải nghiệm mua bán vé tốt nhất cho người dùng, với:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Hệ thống bảo mật cao, đảm bảo thông tin cá nhân được bảo vệ</li>
              <li>Giao dịch minh bạch, công bằng cho cả người mua và người bán</li>
              <li>Hỗ trợ khách hàng 24/7, giải đáp mọi thắc mắc nhanh chóng</li>
              <li>Giao diện thân thiện, dễ sử dụng trên mọi thiết bị</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              Tại sao chọn Pass Vé Phim?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-dark-800 rounded-lg border border-dark-border">
                <h3 className="font-semibold text-dark-text mb-2">🔒 An toàn tuyệt đối</h3>
                <p className="text-sm text-dark-text2">
                  Hệ thống escrow tự động, tiền được giữ an toàn cho đến khi giao dịch hoàn tất
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg border border-dark-border">
                <h3 className="font-semibold text-dark-text mb-2">⚡ Giao dịch nhanh chóng</h3>
                <p className="text-sm text-dark-text2">
                  Quy trình đơn giản, thanh toán và nhận vé chỉ trong vài phút
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg border border-dark-border">
                <h3 className="font-semibold text-dark-text mb-2">💬 Hỗ trợ trực tiếp</h3>
                <p className="text-sm text-dark-text2">
                  Chat trực tiếp với người bán, trao đổi thông tin nhanh chóng
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg border border-dark-border">
                <h3 className="font-semibold text-dark-text mb-2">✅ Xác thực vé</h3>
                <p className="text-sm text-dark-text2">
                  Hệ thống kiểm tra và xác thực vé trước khi giao dịch hoàn tất
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ với chúng tôi qua{" "}
              <a href="/contact" className="text-neon-green hover:underline">
                trang Liên hệ
              </a>{" "}
              hoặc email: support@passvephim.vn
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}

