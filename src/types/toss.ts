export {};

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

type TossPaymentsFactory = {
  (clientKey: string): TossPaymentsInstance;
  ANONYMOUS: string;
};

type TossPaymentsInstance = {
  widgets: (options: { customerKey: string }) => TossPaymentsWidgets;
};

type TossPaymentsWidgets = {
  setAmount: (amount: { currency: "KRW"; value: number }) => Promise<void>;
  renderPaymentMethods: (options: { selector: string; variantKey: string }) => Promise<void>;
  renderAgreement: (options: { selector: string; variantKey: string }) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName: string;
  }) => Promise<void>;
};
