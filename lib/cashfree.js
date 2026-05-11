export const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  env: process.env.CASHFREE_ENV || "TEST",
  baseUrl:
    process.env.CASHFREE_ENV === "PROD"
      ? "https://api.cashfree.com"
      : "https://sandbox.cashfree.com",
};
