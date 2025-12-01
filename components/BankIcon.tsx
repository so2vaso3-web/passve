"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";

interface BankIconProps {
  bankName: string;
  size?: number;
  className?: string;
}

// Map tên ngân hàng với logo URL từ CDN hoặc public sources
// Sử dụng logo từ các nguồn công khai và CDN
const BANK_LOGOS: Record<string, string> = {
  "Vietcombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Vietcombank_logo.svg/200px-Vietcombank_logo.svg.png",
  "Vietinbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VietinBank_logo.svg/200px-VietinBank_logo.svg.png",
  "BIDV": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/BIDV_logo.svg/200px-BIDV_logo.svg.png",
  "Agribank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Agribank_logo.svg/200px-Agribank_logo.svg.png",
  "Techcombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Techcombank_logo.svg/200px-Techcombank_logo.svg.png",
  "MBBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MB_Bank_logo.svg/200px-MB_Bank_logo.svg.png",
  "VPBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/VPBank_logo.svg/200px-VPBank_logo.svg.png",
  "ACB": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ACB_logo.svg/200px-ACB_logo.svg.png",
  "TPBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/TPBank_logo.svg/200px-TPBank_logo.svg.png",
  "HDBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/HDBank_logo.svg/200px-HDBank_logo.svg.png",
  "Sacombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sacombank_logo.svg/200px-Sacombank_logo.svg.png",
  "Eximbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Eximbank_logo.svg/200px-Eximbank_logo.svg.png",
  "MSB": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/MSB_Bank_logo.svg/200px-MSB_Bank_logo.svg.png",
  "VIB": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/VIB_Bank_logo.svg/200px-VIB_Bank_logo.svg.png",
  "SHB": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/SHB_Bank_logo.svg/200px-SHB_Bank_logo.svg.png",
  "OCB": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/OCB_Bank_logo.svg/200px-OCB_Bank_logo.svg.png",
  "VietABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VietABank_logo.svg/200px-VietABank_logo.svg.png",
  "NamABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/NamABank_logo.svg/200px-NamABank_logo.svg.png",
  "PGBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/PGBank_logo.svg/200px-PGBank_logo.svg.png",
  "ABBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/ABBank_logo.svg/200px-ABBank_logo.svg.png",
  "BacABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/BacABank_logo.svg/200px-BacABank_logo.svg.png",
  "SeABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/SeABank_logo.svg/200px-SeABank_logo.svg.png",
  "Kienlongbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kienlongbank_logo.svg/200px-Kienlongbank_logo.svg.png",
  "PVcomBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/PVcomBank_logo.svg/200px-PVcomBank_logo.svg.png",
  "PublicBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/PublicBank_logo.svg/200px-PublicBank_logo.svg.png",
  "Hong Leong Bank": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/HongLeongBank_logo.svg/200px-HongLeongBank_logo.svg.png",
  "Standard Chartered": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Standard_Chartered_logo.svg/200px-Standard_Chartered_logo.svg.png",
  "HSBC": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/HSBC_logo.svg/200px-HSBC_logo.svg.png",
  "ANZ": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/ANZ_logo.svg/200px-ANZ_logo.svg.png",
  "Woori Bank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Woori_Bank_logo.svg/200px-Woori_Bank_logo.svg.png",
};

// Icon fallback component cho các ngân hàng không có logo

export function BankIcon({ bankName, size = 24, className = "" }: BankIconProps) {
  // Tìm tên ngân hàng trong bankName (có thể có format "Vietcombank (VCB)")
  const getBankKey = (name: string): string => {
    const cleanName = name.split("(")[0].trim();
    return cleanName;
  };

  const bankKey = getBankKey(bankName);
  const logoUrl = BANK_LOGOS[bankKey];

  // Nếu có logo URL, dùng Image component với fallback
  if (logoUrl) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src={logoUrl}
          alt={bankKey}
          fill
          className="object-contain"
          onError={(e) => {
            // Fallback to icon if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.parentElement) {
              target.parentElement.innerHTML = `<div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: #10B981;"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h12"/><path d="M6 12h12"/></svg></div>`;
            }
          }}
          unoptimized
        />
      </div>
    );
  }

  // Dùng icon làm fallback
  return (
    <Building2 className={className} size={size} style={{ color: "#10B981" }} />
  );
}

import Image from "next/image";
import { Building2 } from "lucide-react";

interface BankIconProps {
  bankName: string;
  size?: number;
  className?: string;
}

// Map tên ngân hàng với logo URL từ CDN hoặc public sources
// Sử dụng logo từ các nguồn công khai và CDN
const BANK_LOGOS: Record<string, string> = {
  "Vietcombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Vietcombank_logo.svg/200px-Vietcombank_logo.svg.png",
  "Vietinbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VietinBank_logo.svg/200px-VietinBank_logo.svg.png",
  "BIDV": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/BIDV_logo.svg/200px-BIDV_logo.svg.png",
  "Agribank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Agribank_logo.svg/200px-Agribank_logo.svg.png",
  "Techcombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Techcombank_logo.svg/200px-Techcombank_logo.svg.png",
  "MBBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MB_Bank_logo.svg/200px-MB_Bank_logo.svg.png",
  "VPBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/VPBank_logo.svg/200px-VPBank_logo.svg.png",
  "ACB": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ACB_logo.svg/200px-ACB_logo.svg.png",
  "TPBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/TPBank_logo.svg/200px-TPBank_logo.svg.png",
  "HDBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/HDBank_logo.svg/200px-HDBank_logo.svg.png",
  "Sacombank": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sacombank_logo.svg/200px-Sacombank_logo.svg.png",
  "Eximbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Eximbank_logo.svg/200px-Eximbank_logo.svg.png",
  "MSB": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/MSB_Bank_logo.svg/200px-MSB_Bank_logo.svg.png",
  "VIB": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/VIB_Bank_logo.svg/200px-VIB_Bank_logo.svg.png",
  "SHB": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/SHB_Bank_logo.svg/200px-SHB_Bank_logo.svg.png",
  "OCB": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/OCB_Bank_logo.svg/200px-OCB_Bank_logo.svg.png",
  "VietABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VietABank_logo.svg/200px-VietABank_logo.svg.png",
  "NamABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/NamABank_logo.svg/200px-NamABank_logo.svg.png",
  "PGBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/PGBank_logo.svg/200px-PGBank_logo.svg.png",
  "ABBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/ABBank_logo.svg/200px-ABBank_logo.svg.png",
  "BacABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/BacABank_logo.svg/200px-BacABank_logo.svg.png",
  "SeABank": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/SeABank_logo.svg/200px-SeABank_logo.svg.png",
  "Kienlongbank": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kienlongbank_logo.svg/200px-Kienlongbank_logo.svg.png",
  "PVcomBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/PVcomBank_logo.svg/200px-PVcomBank_logo.svg.png",
  "PublicBank": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/PublicBank_logo.svg/200px-PublicBank_logo.svg.png",
  "Hong Leong Bank": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/HongLeongBank_logo.svg/200px-HongLeongBank_logo.svg.png",
  "Standard Chartered": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Standard_Chartered_logo.svg/200px-Standard_Chartered_logo.svg.png",
  "HSBC": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/HSBC_logo.svg/200px-HSBC_logo.svg.png",
  "ANZ": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/ANZ_logo.svg/200px-ANZ_logo.svg.png",
  "Woori Bank": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Woori_Bank_logo.svg/200px-Woori_Bank_logo.svg.png",
};

// Icon fallback component cho các ngân hàng không có logo

export function BankIcon({ bankName, size = 24, className = "" }: BankIconProps) {
  // Tìm tên ngân hàng trong bankName (có thể có format "Vietcombank (VCB)")
  const getBankKey = (name: string): string => {
    const cleanName = name.split("(")[0].trim();
    return cleanName;
  };

  const bankKey = getBankKey(bankName);
  const logoUrl = BANK_LOGOS[bankKey];

  // Nếu có logo URL, dùng Image component với fallback
  if (logoUrl) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src={logoUrl}
          alt={bankKey}
          fill
          className="object-contain"
          onError={(e) => {
            // Fallback to icon if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.parentElement) {
              target.parentElement.innerHTML = `<div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: #10B981;"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h12"/><path d="M6 12h12"/></svg></div>`;
            }
          }}
          unoptimized
        />
      </div>
    );
  }

  // Dùng icon làm fallback
  return (
    <Building2 className={className} size={size} style={{ color: "#10B981" }} />
  );
}
