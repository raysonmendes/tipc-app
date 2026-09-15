import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function PermissionModal({ visible, onDismiss, onConfirm }: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="shield-alert" color="#1E3A8A" />
        <Dialog.Title style={{ textAlign: "center" }}>
          Permissão de Telemetria
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            O **App TIPC** precisa de acesso ao leitor de notificações para
            capturar automaticamente os valores e distâncias das corridas da 99
            em segundo plano.
          </Text>
          <Text
            variant="bodyMedium"
            style={{ marginTop: 8, fontWeight: "bold" }}
          >
            Sem essa permissão, a auditoria do turno e o cálculo do CPK (R$
            0,35/km) não funcionarão.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor="#6B7280">
            Agora não
          </Button>
          <Button mode="contained" onPress={onConfirm} buttonColor="#1E3A8A">
            Ativar Acesso
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
