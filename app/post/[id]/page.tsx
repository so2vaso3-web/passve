import { TicketCard } from "@/components/TicketCard";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";

// Mock data - sẽ thay bằng API call sau
async function getTicket(id: string) {
  // TODO: Fetch from API
  return {
    id,
    title: "Vé xem phim Dune 2 - Ghế VIP, Rạp CGV Vincom",
    description: `Vé xem phim Dune 2 tại rạp CGV Vincom, ghế VIP với view đẹp nhất.

Thông tin chi tiết:
- Ngày chiếu: 15/03/2025
- Giờ chiếu: 20:00
- Rạp: CGV Vincom Center, Hà Nội
- Ghế: H12, H13 (2 vé)
- Giá gốc: 300,000đ/vé
- Giá bán: 250,000đ/vé (giảm 17%)

Lý do bán: Không thể đi được do có việc đột xuất.

Vé còn hạn sử dụng, có thể đổi lịch nếu cần.`,
    price: 250000,
    originalPrice: 300000,
    location: "CGV Vincom, Hà Nội",
    category: "movie",
    images: [],
    seller: {
      name: "Nguyễn Văn A",
      avatar: undefined,
      rating: 4.8,
      totalSales: 12,
    },
    createdAt: "2025-01-01",
  };
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/" label="Quay lại Trang chủ" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
              <div className="relative w-full h-96 bg-dark-bg rounded-xl overflow-hidden mb-4">
                {ticket.images && ticket.images.length > 0 ? (
                  <Image
                    src={ticket.images[0]}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-dark-text2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {ticket.images && ticket.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {ticket.images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative h-20 bg-dark-bg rounded-xl overflow-hidden border border-dark-border">
                      <Image src={img} alt={`${ticket.title} ${idx + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
              <h2 className="text-2xl font-heading font-bold text-dark-text mb-4">
                Mô tả chi tiết
              </h2>
              <div className="prose max-w-none">
                <p className="text-dark-text2 whitespace-pre-line leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
              <h2 className="text-2xl font-heading font-bold text-dark-text mb-4">
                Thông tin người bán
              </h2>
              <div className="flex items-center gap-4">
                {ticket.seller.avatar ? (
                  <img
                    src={ticket.seller.avatar}
                    alt={ticket.seller.name}
                    className="w-16 h-16 rounded-full border-2 border-dark-border object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center text-white font-heading font-bold text-xl">
                    {ticket.seller.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-dark-text text-lg">
                    {ticket.seller.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(ticket.seller.rating) ? "text-yellow-400" : "text-dark-text2"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-dark-text2 text-sm">
                      {ticket.seller.rating} ({ticket.seller.totalSales} giao dịch)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6 sticky top-24">
              <h1 className="text-2xl font-heading font-bold text-dark-text mb-4">
                {ticket.title}
              </h1>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-dark-text2 mb-1">Giá bán</p>
                  <p className="text-3xl font-heading font-black text-neon-green-light text-glow">
                    {formatPrice(ticket.price)} đ
                  </p>
                </div>
                {ticket.originalPrice && (
                  <div>
                    <p className="text-sm text-dark-text2 mb-1">Giá gốc</p>
                    <p className="text-lg text-dark-text2 line-through">
                      {formatPrice(ticket.originalPrice)} đ
                    </p>
                    <p className="text-sm text-neon-green font-semibold">
                      Giảm {Math.round((1 - ticket.price / ticket.originalPrice) * 100)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-dark-text2 mb-1">Địa điểm</p>
                  <p className="text-dark-text font-semibold">{ticket.location}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-neon-green hover:bg-neon-green-light text-white py-4 rounded-xl font-heading font-bold text-lg transition-all hover:shadow-neon">
                  Mua ngay
                </button>
                <button className="w-full border-2 border-neon-green text-neon-green py-4 rounded-xl font-heading font-bold text-lg hover:bg-neon-green/10 transition-all">
                  Chat với người bán
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-dark-border">
                <div className="flex items-center gap-2 text-sm text-dark-text2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Đăng lúc {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tickets */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-dark-text mb-6">
            Vé tương tự
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mock related tickets */}
            {[1, 2, 3, 4].map((i) => (
              <TicketCard
                key={i}
                id={`${i}`}
                title="Vé xem phim tương tự"
                price={200000 + i * 50000}
                location="Hà Nội"
                category="movie"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

