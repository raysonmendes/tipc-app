export const numberFormatter = {
  /**
   * Transforma números digitados em formato de moeda/odômetro brasileiro com 1 casa decimal.
   * Exemplo de entrada física (digitação acumulada):
   * "5" -> "0,5"
   * "58" -> "5,8"
   * "588" -> "58,8"
   * "5880" -> "588,0"
   * "58804" -> "5.880,4"
   */
  maskText(value: string | number): string {
    if (value === undefined || value === null || value === "") return "";

    // Cenário 1: Se já for um número puro vindo do banco (ex: 35 ou 21.5)
    if (typeof value === "number") {
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value);
    }

    // Cenário 2: Usuário digitando no Input (Mascara Viva)
    // 1. Remove tudo que não for número ou vírgula
    let cleanValue = value.replace(/[^\d,]/g, "");
    if (!cleanValue) return "";

    // 2. Se houver mais de uma vírgula, mantém apenas a primeira
    const partesVirgula = cleanValue.split(",");
    if (partesVirgula.length > 2) {
      cleanValue = partesVirgula[0] + "," + partesVirgula.slice(1).join("");
    }

    // 3. Separa a parte inteira da decimal para formatar os milhares separadamente
    const [integerPart, decimalPart] = cleanValue.split(",");

    // Aplica os pontos de milhar na parte inteira (ex: 35000 vira 35.000)
    const maskedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // 4. Retorna a formatação de acordo com o que existe na string no momento
    if (decimalPart !== undefined) {
      // Se o usuário digitou a vírgula, limita as casas decimais em até 3
      return `${maskedInteger},${decimalPart.substring(0, 3)}`;
    }

    // Se não tem vírgula ainda, retorna apenas o número inteiro limpo (ex: "3" ou "35")
    return maskedInteger;
  },
  /**
   * Pega o texto mascarado do input e o transforma em um número puro (float)
   * mantendo a precisão de até 3 casas decimais para cálculos e banco de dados.
   */
  parseToNumber(maskedText: string): number {
    if (!maskedText) return 0;
    const cleanValue = maskedText.replace(/[^\d]/g, "");

    if (cleanValue === "") return 0;

    const parsed = Number(cleanValue);

    const result = parsed / 10;

    return result;
  },
};
