export const inputMasks = {
  odometer(value: string): string {
    const cleanValue = value.replace(/[^\d]/g, "");
    if (!cleanValue || cleanValue === "00") return "";

    const numberValue = Number(cleanValue) / 10; // Divide by 10 to account for the decimal place

    const maskedValue = numberValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    return maskedValue;
  },
};
