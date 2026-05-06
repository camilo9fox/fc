import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ConfirmDialog, {
  ConfirmDialogTone,
} from "../components/shared/ConfirmDialog";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

interface PendingDialog {
  options: ConfirmDialogOptions;
  resolve: (value: boolean) => void;
}

const ConfirmDialogContext = createContext<
  ConfirmDialogContextValue | undefined
>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );

  const closeDialog = useCallback((result: boolean) => {
    setPendingDialog((current) => {
      if (!current) return null;
      current.resolve(result);
      return null;
    });
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingDialog({ options, resolve });
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      confirm,
    }),
    [confirm],
  );

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        isOpen={Boolean(pendingDialog)}
        title={pendingDialog?.options.title ?? ""}
        description={pendingDialog?.options.description ?? ""}
        confirmLabel={pendingDialog?.options.confirmLabel}
        cancelLabel={pendingDialog?.options.cancelLabel}
        tone={pendingDialog?.options.tone}
        onCancel={() => closeDialog(false)}
        onConfirm={() => closeDialog(true)}
      />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider",
    );
  }
  return context;
};
