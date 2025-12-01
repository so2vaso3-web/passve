export interface Bank {
  name: string;
  shortName: string;
  code: string;
}

export const BANKS: Bank[] = [
  { name: "Vietcombank", shortName: "VCB", code: "VCB" },
  { name: "Vietinbank", shortName: "CTG", code: "CTG" },
  { name: "BIDV", shortName: "BIDV", code: "BIDV" },
  { name: "Agribank", shortName: "Agribank", code: "VBA" },
  { name: "Techcombank", shortName: "TCB", code: "TCB" },
  { name: "MBBank", shortName: "MB", code: "MB" },
  { name: "VPBank", shortName: "VPBank", code: "VPB" },
  { name: "ACB", shortName: "ACB", code: "ACB" },
  { name: "TPBank", shortName: "TPBank", code: "TPB" },
  { name: "HDBank", shortName: "HDBank", code: "HDB" },
  { name: "Sacombank", shortName: "STB", code: "STB" },
  { name: "Eximbank", shortName: "Eximbank", code: "EIB" },
  { name: "MSB", shortName: "MSB", code: "MSB" },
  { name: "VIB", shortName: "VIB", code: "VIB" },
  { name: "SHB", shortName: "SHB", code: "SHB" },
  { name: "OCB", shortName: "OCB", code: "OCB" },
  { name: "VietABank", shortName: "VietABank", code: "VAB" },
  { name: "NamABank", shortName: "NamABank", code: "NAB" },
  { name: "PGBank", shortName: "PGBank", code: "PGB" },
  { name: "ABBank", shortName: "ABBank", code: "ABB" },
  { name: "BacABank", shortName: "BacABank", code: "BAB" },
  { name: "SeABank", shortName: "SeABank", code: "SEA" },
  { name: "Kienlongbank", shortName: "Kienlongbank", code: "KLB" },
  { name: "PVcomBank", shortName: "PVcomBank", code: "PVC" },
  { name: "PublicBank", shortName: "PublicBank", code: "PUB" },
  { name: "Hong Leong Bank", shortName: "Hong Leong", code: "HLB" },
  { name: "Standard Chartered", shortName: "SCB", code: "SCB" },
  { name: "HSBC", shortName: "HSBC", code: "HSBC" },
  { name: "ANZ", shortName: "ANZ", code: "ANZ" },
  { name: "Woori Bank", shortName: "Woori", code: "WRB" },
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

