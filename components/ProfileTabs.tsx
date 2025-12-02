"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TicketCard } from "@/components/TicketCard";
import { SellingPostCard } from "@/components/SellingPostCard";
import { WalletBox } from "@/components/WalletBox";
import { BankAccountForm } from "@/components/BankAccountForm";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { ChatRoomCard } from "@/components/ChatRoomCard";
import { PurchasedTicketsTab } from "@/components/PurchasedTicketsTab";
import { 
  Package, 
  CheckCircle, 
  ShoppingBag, 
  Wallet, 
  CreditCard,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  MessageCircle,
  Ticket
} from "lucide-react";
import toast from "react-hot-toast";

interface ProfileTabsProps {
  activeTab: string;
  userId: string;
  wallet: {
    balance: number;
    escrow: number;
    totalEarned: number;
  };
  bankAccounts: any[];
}

export function ProfileTabs({ activeTab: initialTab, userId, wallet, bankAccounts: initialBankAccounts }: ProfileTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tickets, setTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (shouldLoadTickets) {
        // For purchased tab, get sold tickets where user is the buyer
        const status = activeTab === "selling" ? "active" : "sold";
        try {
          const res = await fetch(`/api/tickets?user=${userId}&status=${status}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            setTickets(data.tickets || []);
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("Error fetching tickets:", errorData);
            setTickets([]);
          }
        } catch (error: any) {
          console.error("Error fetching tickets:", error);
          setTickets([]);
          toast.error("Lỗi khi tải danh sách vé");
        }
      } else if (activeTab === "messages") {
        try {
          const res = await fetch(`/api/chat/rooms`, {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            setChatRooms(data.rooms || []);
            console.log("✅ Loaded chat rooms:", data.rooms?.length || 0);
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("Error fetching chat rooms:", errorData);
            setChatRooms([]);
            toast.error("Lỗi khi tải tin nhắn");
          }
        } catch (error: any) {
          console.error("Error fetching chat rooms:", error);
          setChatRooms([]);
          toast.error("Lỗi khi tải tin nhắn");
        }
      } else if (activeTab === "transactions") {
        const res = await fetch(`/api/wallet/transactions`, {
          cache: "no-store",
        });
        const data = await res.json();
        setTransactions(data.transactions || []);
      } else if (activeTab === "bank") {
        const res = await fetch(`/api/bank`, {
          cache: "no-store",
        });
        const data = await res.json();
        setBankAccounts(data.bankAccounts || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    const currentScroll = window.scrollY;
    setActiveTab(tab);
    window.history.pushState({}, "", `/profile?tab=${tab}`);
    setTimeout(() => {
      window.scrollTo(0, currentScroll);
    }, 0);
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      const res = await fetch(`/api/bank/${bankId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa tài khoản");
        // Refresh bank accounts immediately
        try {
          const bankRes = await fetch(`/api/bank`, {
            cache: "no-store",
          });
          if (bankRes.ok) {
            const data = await bankRes.json();
            setBankAccounts(data.bankAccounts || []);
          }
        } catch (error) {
          console.error("Error refreshing bank accounts:", error);
        }
        loadData();
      } else {
        throw new Error("Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const tabs = [
    { id: "selling", label: "Tin đang bán", icon: Package },
    { id: "sold", label: "Tin đã bán", icon: CheckCircle },
    { id: "purchased", label: "Vé đã mua", icon: ShoppingBag },
    { id: "messages", label: "Tin nhắn", icon: MessageCircle },
    { id: "transactions", label: "Ví & giao dịch", icon: Wallet },
    { id: "deposit", label: "Nạp tiền", icon: ArrowUp },
    { id: "withdraw", label: "Rút tiền", icon: ArrowDown },
    { id: "bank", label: "Ngân hàng của tôi", icon: CreditCard },
  ];

  // Remove purchased from loadData since it's handled separately
  const shouldLoadTickets = activeTab === "selling" || activeTab === "sold";

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden">
      {/* Tabs - Ẩn trên mobile, chỉ hiển thị trên desktop */}
      <div className="hidden md:block border-b border-[#1F2937] bg-[#0B0F19]">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#10B981] border-b-2 border-[#10B981] bg-[#111827]"
                    : "text-white/70 hover:text-[#10B981]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Hiển thị title của tab hiện tại */}
      <div className="md:hidden border-b border-[#1F2937] bg-[#0B0F19] px-4 py-3">
        {(() => {
          const currentTab = tabs.find(t => t.id === activeTab);
          const Icon = currentTab?.icon || Package;
          return (
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-lg font-bold text-white">{currentTab?.label || "Tin đang bán"}</h2>
            </div>
          );
        })()}
      </div>

      {/* Tab Content */}
      <div className="p-3 sm:p-4 md:p-6 bg-[#111827]">
        {activeTab === "transactions" && (
          <div>
            <WalletBox balance={wallet.balance} escrow={wallet.escrow} totalEarned={wallet.totalEarned} />

            <h3 className="text-xl font-bold text-white mb-4 mt-6">Lịch sử giao dịch</h3>
            {loading ? (
              <div className="text-center py-8 text-white/70">Đang tải...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-white/70">Chưa có giao dịch nào</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="border border-[#1F2937] rounded-xl p-4 bg-[#0B0F19] hover:border-[#10B981] hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{tx.description}</p>
                        <p className="text-sm text-white/70">
                          {new Date(tx.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            tx.type === "deposit" || tx.type === "sale" || tx.type === "escrow_release" || tx.type === "refund"
                              ? "text-[#10B981]"
                              : "text-red-400"
                          }`}
                        >
                          {tx.type === "deposit" || tx.type === "sale" || tx.type === "escrow_release" || tx.type === "refund"
                            ? "+"
                            : "-"}
                          {new Intl.NumberFormat("vi-VN").format(tx.amount)} đ
                        </p>
                        <p
                          className={`text-xs ${
                            tx.status === "completed"
                              ? "text-[#10B981]"
                              : tx.status === "pending"
                              ? "text-yellow-400"
                              : "text-white/70"
                          }`}
                        >
                          {tx.status === "completed"
                            ? "Hoàn thành"
                            : tx.status === "pending"
                            ? "Đang xử lý"
                            : "Đã hủy"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "deposit" && (
          <DepositForm
            userId={userId}
            onClose={() => handleTabChange("transactions")}
            onSuccess={loadData}
          />
        )}

        {activeTab === "withdraw" && (
          <WithdrawForm
            balance={wallet.balance}
            onClose={() => handleTabChange("transactions")}
            onSuccess={loadData}
          />
        )}

        {activeTab === "bank" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Tài khoản ngân hàng</h3>
              <button
                onClick={() => {
                  setEditingBank(null);
                  setShowBankForm(true);
                }}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm tài khoản
              </button>
            </div>

            {bankAccounts.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-white/70 mx-auto mb-4" />
                <p className="text-white/70 mb-4">Chưa có tài khoản ngân hàng</p>
                <button
                  onClick={() => {
                    setEditingBank(null);
                    setShowBankForm(true);
                  }}
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-7 py-3 rounded-xl font-semibold transition-all"
                >
                  Thêm tài khoản đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {bankAccounts.map((bank) => (
                  <div
                    key={bank._id}
                    className="border border-[#1F2937] rounded-xl p-4 bg-[#0B0F19] hover:border-[#10B981] hover:scale-[1.02] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-white mb-1">{bank.bankName}</p>
                        <p className="text-sm text-white/70">STK: {bank.accountNumber}</p>
                        <p className="text-sm text-white/70">Chủ TK: {bank.accountHolder}</p>
                        {bank.branch && <p className="text-sm text-white/70">Chi nhánh: {bank.branch}</p>}
                      </div>
                      {bank.isDefault && (
                        <span className="bg-[#10B981] text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBank(bank);
                          setShowBankForm(true);
                        }}
                        className="flex-1 px-3 py-2 border border-[#1F2937] text-white/70 rounded-xl hover:bg-[#1F2937] hover:text-[#10B981] transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBank(bank._id)}
                        className="px-3 py-2 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Tin nhắn của tôi
            </h3>
            {loading ? (
              <div className="text-center py-8 text-white/70">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-white/70 mx-auto mb-4" />
                <p className="text-white/70">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatRooms.map((room) => (
                  <ChatRoomCard key={room._id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "purchased" && (
          <PurchasedTicketsTab userId={userId} />
        )}

        {(activeTab === "selling" || activeTab === "sold") && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981] mb-4"></div>
                <p className="text-white/70">Đang tải vé...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg font-semibold mb-2">
                  {activeTab === "sold" ? "Chưa có vé đã bán" : "Chưa có vé đang bán"}
                </p>
                <p className="text-white/50 text-sm">
                  {activeTab === "sold"
                    ? "Bạn chưa bán vé nào. Hãy đăng tin bán vé để bắt đầu!"
                    : "Bạn chưa có vé nào đang bán. Hãy đăng tin bán vé ngay!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {tickets.map((ticket: any) => {
                  const ticketId = ticket.id || ticket._id?.toString() || "";
                  const ticketProps = {
                    id: ticketId,
                    title: ticket.title || "Không có tiêu đề",
                    price: ticket.price || ticket.sellingPrice || 0,
                    originalPrice: ticket.originalPrice,
                    location: ticket.location || `${ticket.cinema || ""}, ${ticket.city || ""}`.replace(/^,\s*|,\s*$/g, "") || "Chưa có địa điểm",
                    category: ticket.category || "other",
                    image: ticket.image,
                    seller: ticket.seller || { name: "Unknown" },
                    showDate: ticket.showDate,
                    showTime: ticket.showTime,
                    expireAt: ticket.expireAt,
                    isExpired: ticket.isExpired,
                    createdAt: ticket.createdAt,
                    movieTitle: ticket.movieTitle,
                    cinema: ticket.cinema,
                    city: ticket.city,
                    seats: ticket.seats,
                    status: ticket.status || "sold",
                    onHoldBy: ticket.onHoldBy,
                    ticketCode: ticket.ticketCode,
                    qrImage: ticket.qrImage 
                      ? (Array.isArray(ticket.qrImage) ? ticket.qrImage : (ticket.qrImage ? [ticket.qrImage] : undefined))
                      : undefined,
                    buyer: ticket.buyer,
                    buyerEmail: ticket.buyerEmail,
                    soldAt: ticket.soldAt,
                  };
                  
                  return activeTab === "selling" ? (
                    <SellingPostCard key={ticketId} ticket={ticketProps} onUpdate={loadData} />
                  ) : (
                    <TicketCard key={ticketId} {...ticketProps} />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showBankForm && (
        <BankAccountForm
          account={editingBank}
          onClose={() => {
            setShowBankForm(false);
            setEditingBank(null);
          }}
          onSuccess={async () => {
            // Refresh bank accounts immediately
            try {
              const res = await fetch(`/api/bank`, {
                cache: "no-store",
              });
              if (res.ok) {
                const data = await res.json();
                setBankAccounts(data.bankAccounts || []);
                toast.success("Đã cập nhật danh sách tài khoản");
              } else {
                // Retry after a short delay
                setTimeout(async () => {
                  try {
                    const retryRes = await fetch(`/api/bank`, {
                      cache: "no-store",
                    });
                    if (retryRes.ok) {
                      const retryData = await retryRes.json();
                      setBankAccounts(retryData.bankAccounts || []);
                    }
                  } catch (error) {
                    console.error("Error retrying bank accounts:", error);
                  }
                }, 500);
              }
            } catch (error) {
              console.error("Error refreshing bank accounts:", error);
              // Retry after a short delay
              setTimeout(async () => {
                try {
                  const retryRes = await fetch(`/api/bank`, {
                    cache: "no-store",
                  });
                  if (retryRes.ok) {
                    const retryData = await retryRes.json();
                    setBankAccounts(retryData.bankAccounts || []);
                  }
                } catch (retryError) {
                  console.error("Error retrying bank accounts:", retryError);
                }
              }, 500);
            }
            loadData();
            router.refresh();
          }}
        />
      )}

      {showDepositForm && (
        <DepositForm
          userId={userId}
          onClose={() => setShowDepositForm(false)}
          onSuccess={loadData}
        />
      )}

      {showWithdrawForm && (
        <WithdrawForm
          balance={wallet.balance}
          onClose={() => setShowWithdrawForm(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

