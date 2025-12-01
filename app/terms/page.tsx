import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Điều khoản sử dụng - Pass Vé Phim",
  description: "Điều khoản và điều kiện sử dụng dịch vụ Pass Vé Phim",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Điều khoản sử dụng
        </h1>

        <Card className="p-8 space-y-6 bg-dark-card border-dark-border">
          <section>
            <p className="text-sm text-dark-text2 mb-6">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
            </p>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Bằng việc sử dụng dịch vụ của Pass Vé Phim, bạn đồng ý với các điều khoản và điều kiện 
              được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              1. Chấp nhận điều khoản
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Khi truy cập và sử dụng website Pass Vé Phim, bạn xác nhận rằng bạn đã đọc, hiểu và 
              đồng ý tuân thủ các điều khoản này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, 
              vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              2. Đăng ký tài khoản
            </h2>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản</li>
              <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình</li>
              <li>Bạn phải từ 18 tuổi trở lên để sử dụng dịch vụ</li>
              <li>Mỗi người chỉ được đăng ký một tài khoản</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              3. Quy định về đăng bán vé
            </h2>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Bạn chỉ được đăng bán vé hợp pháp, có nguồn gốc rõ ràng</li>
              <li>Vé phải còn hiệu lực và chưa được sử dụng</li>
              <li>Bạn phải cung cấp thông tin chính xác về vé (ngày, giờ, địa điểm, giá)</li>
              <li>Không được đăng bán vé giả, vé không hợp pháp</li>
              <li>Giá bán phải hợp lý, không được lừa đảo người mua</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              4. Quy định về mua vé
            </h2>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Bạn phải thanh toán đúng số tiền đã thỏa thuận</li>
              <li>Sau khi thanh toán, bạn không được hủy giao dịch nếu không có lý do chính đáng</li>
              <li>Bạn phải kiểm tra vé kỹ trước khi xác nhận nhận vé</li>
              <li>Nếu phát hiện vé giả, bạn có quyền khiếu nại trong vòng 24 giờ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              5. Hệ thống Escrow
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Pass Vé Phim sử dụng hệ thống escrow để bảo vệ quyền lợi của cả người mua và người bán:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Tiền được giữ trong tài khoản escrow cho đến khi giao dịch hoàn tất</li>
              <li>Người bán chỉ nhận được tiền sau khi người mua xác nhận nhận vé</li>
              <li>Nếu có tranh chấp, chúng tôi sẽ can thiệp và giải quyết công bằng</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              6. Phí dịch vụ
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Pass Vé Phim có thể thu phí dịch vụ từ người bán hoặc người mua. Phí dịch vụ sẽ được 
              thông báo rõ ràng trước khi bạn thực hiện giao dịch. Bằng việc sử dụng dịch vụ, bạn 
              đồng ý với mức phí này.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              7. Trách nhiệm và giới hạn
            </h2>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Pass Vé Phim chỉ là nền tảng kết nối người mua và người bán</li>
              <li>Chúng tôi không chịu trách nhiệm về chất lượng, tính hợp pháp của vé</li>
              <li>Người bán chịu trách nhiệm về thông tin vé mà họ cung cấp</li>
              <li>Chúng tôi sẽ cố gắng giải quyết tranh chấp một cách công bằng</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              8. Vi phạm và xử lý
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Nếu bạn vi phạm các điều khoản này, chúng tôi có quyền:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Cảnh báo hoặc khóa tài khoản tạm thời</li>
              <li>Khóa tài khoản vĩnh viễn nếu vi phạm nghiêm trọng</li>
              <li>Yêu cầu bồi thường thiệt hại nếu có</li>
              <li>Chuyển giao thông tin cho cơ quan pháp luật nếu cần</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              9. Thay đổi điều khoản
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực 
              ngay sau khi được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có 
              thay đổi được xem như bạn đã chấp nhận các điều khoản mới.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              10. Liên hệ
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ với chúng tôi qua{" "}
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

