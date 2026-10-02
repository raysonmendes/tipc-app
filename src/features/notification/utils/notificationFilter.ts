// Lista de pacotes permitidos (White-list)
const ALLOWED_PACKAGES = [
  "com.app99.driver", // 99 Motorista
  "com.ubercab.driver", // Uber Driver (exemplo futuro)
];

export const notificationFilter = {
  /**
   * Retorna true se o pacote da notificação for um dos permitidos.
   * Se você quiser salvar TUDO para testes, mude temporariamente para retornar sempre true.
   */
  shouldSave(packageName?: string): boolean {
    if (!packageName) return false;

    // 💡 Para os primeiros testes: mude para 'return true'
    // return true;

    return ALLOWED_PACKAGES.includes(packageName);
  },
};
