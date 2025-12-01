export interface Bank {
  name: string;
  shortName: string;
  code: string;
  icon?: string;
}

export const BANKS: Bank[] = [
  { name: "Vietcombank", shortName: "VCB", code: "VCB", icon: "🏦" },
  { name: "Vietinbank", shortName: "CTG", code: "CTG", icon: "🏛️" },
  { name: "BIDV", shortName: "BIDV", code: "BIDV", icon: "🏢" },
  { name: "Agribank", shortName: "Agribank", code: "VBA", icon: "🌾" },
  { name: "Techcombank", shortName: "TCB", code: "TCB", icon: "💻" },
  { name: "MBBank", shortName: "MB", code: "MB", icon: "📱" },
  { name: "VPBank", shortName: "VPBank", code: "VPB", icon: "💳" },
  { name: "ACB", shortName: "ACB", code: "ACB", icon: "🏪" },
  { name: "TPBank", shortName: "TPBank", code: "TPB", icon: "🏬" },
  { name: "HDBank", shortName: "HDBank", code: "HDB", icon: "🏗️" },
  { name: "Sacombank", shortName: "STB", code: "STB", icon: "🏦" },
  { name: "Eximbank", shortName: "Eximbank", code: "EIB", icon: "🌍" },
  { name: "MSB", shortName: "MSB", code: "MSB", icon: "🏛️" },
  { name: "VIB", shortName: "VIB", code: "VIB", icon: "💼" },
  { name: "SHB", shortName: "SHB", code: "SHB", icon: "🏦" },
  { name: "OCB", shortName: "OCB", code: "OCB", icon: "🏢" },
  { name: "VietABank", shortName: "VietABank", code: "VAB", icon: "🏛️" },
  { name: "NamABank", shortName: "NamABank", code: "NAB", icon: "🏦" },
  { name: "PGBank", shortName: "PGBank", code: "PGB", icon: "🏪" },
  { name: "ABBank", shortName: "ABBank", code: "ABB", icon: "🏬" },
  { name: "BacABank", shortName: "BacABank", code: "BAB", icon: "🏗️" },
  { name: "SeABank", shortName: "SeABank", code: "SEA", icon: "🌊" },
  { name: "Kienlongbank", shortName: "Kienlongbank", code: "KLB", icon: "🏦" },
  { name: "PVcomBank", shortName: "PVcomBank", code: "PVC", icon: "⚡" },
  { name: "PublicBank", shortName: "PublicBank", code: "PUB", icon: "🌐" },
  { name: "Hong Leong Bank", shortName: "Hong Leong", code: "HLB", icon: "🏦" },
  { name: "Standard Chartered", shortName: "SCB", code: "SCB", icon: "🌍" },
  { name: "HSBC", shortName: "HSBC", code: "HSBC", icon: "🏛️" },
  { name: "ANZ", shortName: "ANZ", code: "ANZ", icon: "🏢" },
  { name: "Woori Bank", shortName: "Woori", code: "WRB", icon: "🏦" },
];

// Helper function để tìm bank theo tên
export function findBankByName(name: string): Bank | undefined {
  return BANKS.find(
    (bank) =>
      bank.name.toLowerCase() === name.toLowerCase() ||
      bank.shortName.toLowerCase() === name.toLowerCase() ||
      bank.code.toLowerCase() === name.toLowerCase()
  );
}
