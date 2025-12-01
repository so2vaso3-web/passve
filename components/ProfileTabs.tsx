"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TicketCard } from "@/components/TicketCard";
import { WalletBox } from "@/components/WalletBox";
import { BankAccountForm } from "@/components/BankAccountForm";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { ChatRoomCard } from "@/components/ChatRoomCard";
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
  MessageCircle
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
      if (activeTab === "selling" || activeTab === "sold" || activeTab === "purchased") {
        // For purchased tab, get both on_hold and purchased tickets
        if (activeTab === "purchased") {
          const [onHoldRes, purchasedRes] = await Promise.all([
            fetch(`/api/tickets?user=${userId}&status=on_hold`, { cache: "no-store" }),
            fetch(`/api/tickets?user=${userId}&status=purchased`, { cache: "no-store" }),
          ]);
          const onHoldData = await onHoldRes.json();
          const purchasedData = await purchasedRes.json();
          setTickets([...(onHoldData.tickets || []), ...(purchasedData.tickets || [])]);
        } else {
          const status = activeTab === "selling" ? "active" : "sold";
          const res = await fetch(`/api/tickets?user=${userId}&status=${status}`, {
            cache: "no-store",
          });
          const data = await res.json();
          setTickets(data.tickets || []);
        }
      } else if (activeTab === "messages") {
        const res = await fetch(`/api/chat/rooms`, {
          cache: "no-store",
        });
        const data = await res.json();
        setChatRooms(data.rooms || []);
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
    { id: "bank", label: "Ngân hàng của tôi", icon: CreditCard },
  ];

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-[#1F2937] bg-[#0B0F19]">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#10B981] border-b-2 border-[#10B981] bg-[#111827]"
                    : "text-white/70 hover:text-[#10B981]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6 bg-[#111827]">
        {activeTab === "transactions" && (
          <div>
            <WalletBox balance={wallet.balance} escrow={wallet.escrow} totalEarned={wallet.totalEarned} />
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowDepositForm(true)}
                className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-7 py-3 rounded-xl font-semibold transition-all hover:shadow-neon flex items-center justify-center gap-2"
              >
                <ArrowUp className="w-5 h-5" />
                Nạp tiền
              </button>
              <button
                onClick={() => setShowWithdrawForm(true)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold transition-all hover:shadow-neon flex items-center justify-center gap-2"
              >
                <ArrowDown className="w-5 h-5" />
                Rút tiền
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">Lịch sử giao dịch</h3>
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
                            tx.type === "deposit" || tx.type === "sale" || tx.type === "escrow_release"
                              ? "text-[#10B981]"
                              : "text-red-400"
                          }`}
                        >
                          {tx.type === "deposit" || tx.type === "sale" || tx.type === "escrow_release"
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

        {activeTab === "bank" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Tài khoản ngân hàng</h3>
              <button
                onClick={() => {
                  setEditingBank(null);
                  setShowBankForm(true);
                }}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {(activeTab === "selling" || activeTab === "sold" || activeTab === "purchased") && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-white/70">Đang tải...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-white/70 mx-auto mb-4" />
                <p className="text-white/70">Chưa có vé nào</p>
              </div>
            ) : (
              <>
                {activeTab === "purchased" && tickets.some((t: any) => t.status === "on_hold") && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Vé đang giữ - Cần thanh toán</h4>
                        <p className="text-sm text-white/70">
                          Bạn có vé đang được giữ. Vui lòng chờ người bán gửi mã vé và xác nhận nhận được trong vòng 15 phút để hoàn tất giao dịch.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} {...ticket} />
                  ))}
                </div>
              </>
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
          onSuccess={loadData}
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

