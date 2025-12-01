import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Chính sách bảo mật - Pass Vé Phim",
  description: "Chính sách bảo mật thông tin cá nhân của Pass Vé Phim",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Chính sách bảo mật
        </h1>

        <Card className="p-8 space-y-6 bg-dark-card border-dark-border">
          <section>
            <p className="text-sm text-dark-text2 mb-6">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
            </p>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Pass Vé Phim cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. 
              Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              1. Thông tin chúng tôi thu thập
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-dark-text mb-2">Thông tin cá nhân:</h3>
                <ul className="list-disc list-inside space-y-1 text-dark-text2 ml-4">
                  <li>Họ và tên</li>
                  <li>Email</li>
                  <li>Số điện thoại</li>
                  <li>Ảnh đại diện (nếu bạn đăng nhập bằng Google/Facebook)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dark-text mb-2">Thông tin giao dịch:</h3>
                <ul className="list-disc list-inside space-y-1 text-dark-text2 ml-4">
                  <li>Lịch sử mua bán vé</li>
                  <li>Thông tin thanh toán (được mã hóa và bảo mật)</li>
                  <li>Tin nhắn trao đổi với người mua/bán</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dark-text mb-2">Thông tin kỹ thuật:</h3>
                <ul className="list-disc list-inside space-y-1 text-dark-text2 ml-4">
                  <li>Địa chỉ IP</li>
                  <li>Loại trình duyệt và thiết bị</li>
                  <li>Dữ liệu cookie và công nghệ tương tự</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              2. Cách chúng tôi sử dụng thông tin
            </h2>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
              <li>Xử lý giao dịch và gửi thông báo liên quan</li>
              <li>Xác thực danh tính và ngăn chặn gian lận</li>
              <li>Gửi thông tin marketing (nếu bạn đồng ý)</li>
              <li>Hỗ trợ khách hàng và giải quyết tranh chấp</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              3. Chia sẻ thông tin
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ 
              thông tin trong các trường hợp sau:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>
                <strong>Với người mua/bán:</strong> Chúng tôi chia sẻ thông tin cần thiết (tên, 
                số điện thoại) để bạn có thể liên hệ và giao dịch
              </li>
              <li>
                <strong>Với nhà cung cấp dịch vụ:</strong> Chúng tôi có thể chia sẻ với các đối tác 
                xử lý thanh toán, lưu trữ dữ liệu (nhưng họ không được sử dụng cho mục đích khác)
              </li>
              <li>
                <strong>Yêu cầu pháp lý:</strong> Nếu có yêu cầu từ cơ quan pháp luật, chúng tôi 
                có thể chia sẻ thông tin theo quy định
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              4. Bảo mật thông tin
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
              <li>Mã hóa mật khẩu bằng bcrypt</li>
              <li>Bảo vệ cơ sở dữ liệu bằng firewall và kiểm soát truy cập</li>
              <li>Giám sát và phát hiện các hoạt động đáng ngờ</li>
              <li>Đào tạo nhân viên về bảo mật thông tin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              5. Cookie và công nghệ theo dõi
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Chúng tôi sử dụng cookie và công nghệ tương tự để:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Ghi nhớ đăng nhập của bạn</li>
              <li>Phân tích cách bạn sử dụng website</li>
              <li>Cải thiện trải nghiệm người dùng</li>
              <li>Hiển thị quảng cáo phù hợp (nếu có)</li>
            </ul>
            <p className="text-dark-text2 leading-relaxed mt-4">
              Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng 
              đến chức năng của website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              6. Quyền của bạn
            </h2>
            <p className="text-dark-text2 leading-relaxed mb-4">
              Bạn có quyền:
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-text2 ml-4">
              <li>Truy cập và xem thông tin cá nhân của mình</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
              <li>Từ chối nhận email marketing</li>
              <li>Khiếu nại về việc xử lý dữ liệu cá nhân</li>
            </ul>
            <p className="text-dark-text2 leading-relaxed mt-4">
              Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua{" "}
              <a href="/contact" className="text-neon-green hover:underline">
                trang Liên hệ
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              7. Thông tin của trẻ em
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Dịch vụ của chúng tôi dành cho người từ 18 tuổi trở lên. Chúng tôi không cố ý thu thập 
              thông tin từ trẻ em dưới 18 tuổi. Nếu phát hiện, chúng tôi sẽ xóa thông tin đó ngay lập tức.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              8. Thay đổi chính sách
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Chúng tôi có thể cập nhật chính sách này theo thời gian. Các thay đổi quan trọng sẽ 
              được thông báo qua email hoặc thông báo trên website. Việc bạn tiếp tục sử dụng dịch vụ 
              sau khi có thay đổi được xem như bạn đã chấp nhận chính sách mới.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-neon-green mb-4">
              9. Liên hệ
            </h2>
            <p className="text-dark-text2 leading-relaxed">
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua{" "}
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

