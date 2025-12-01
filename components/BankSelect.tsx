"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { BankIcon } from "./BankIcon";
import { BANKS } from "@/lib/banks";
import Image from "next/image";

interface BankLogo {
  _id: string;
  bankName: string;
  shortName: string;
  code: string;
  logo: string;
  isActive: boolean;
  displayOrder: number;
}

interface BankSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function BankSelect({
  value,
  onChange,
  placeholder = "Chọn ngân hàng",
  className = "",
  required = false,
}: BankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bankLogos, setBankLogos] = useState<BankLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch bank logos from API
  useEffect(() => {
    const fetchBankLogos = async () => {
      try {
        const res = await fetch("/api/bank-logos");
        if (res.ok) {
          const data = await res.json();
          setBankLogos(data.bankLogos || []);
        }
      } catch (error) {
        console.error("Error fetching bank logos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBankLogos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tìm bank logo từ API, nếu không có thì dùng BANKS hardcode
  const getBankLogo = (bankName: string) => {
    return bankLogos.find((logo) => logo.bankName === bankName);
  };

  const selectedBank = BANKS.find((bank) => bank.name === value);
  const selectedBankLogo = selectedBank ? getBankLogo(selectedBank.name) : null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-primary transition-all text-left flex items-center justify-between bg-white shadow-md hover:shadow-lg ${
          value ? "text-gray-900 font-semibold" : "text-gray-500"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedBank && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5">
              {selectedBankLogo?.logo ? (
                <Image
                  src={selectedBankLogo.logo}
                  alt={selectedBank.name}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : (
                <BankIcon bankName={selectedBank.name} size={20} />
              )}
            </div>
          )}
          <span className="pl-6 truncate">
            {selectedBank ? `${selectedBank.name} (${selectedBank.shortName})` : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : (
            BANKS.map((bank) => {
              const bankLogo = getBankLogo(bank.name);
              return (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => {
                    onChange(bank.name);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-primary-light hover:to-primary/10 transition-all text-left ${
                    value === bank.name ? "bg-gradient-to-r from-primary-light to-primary/10 border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {bankLogo?.logo ? (
                      <Image
                        src={bankLogo.logo}
                        alt={bank.name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <BankIcon bankName={bank.name} size={28} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{bank.name}</div>
                    <div className="text-sm text-gray-600">{bank.shortName}</div>
                  </div>
                  {value === bank.name && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

