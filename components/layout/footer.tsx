import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold">Pass Vé Phim</span>
            </div>
            <p className="text-dark-400 text-sm">
              Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn với hệ thống escrow tự động.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Giới thiệu</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Hướng dẫn</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kết nối</h3>
            <div className="flex gap-4">
              <a href="#" className="text-dark-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-dark-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-800 text-center text-sm text-dark-400">
          <p>&copy; 2025 Pass Vé Phim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



