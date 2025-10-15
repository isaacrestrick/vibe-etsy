const {
  DEMO_ADMIN_USERNAME,
  DEMO_ADMIN_PASSWORD,
  DEMO_CUSTOMER_USERNAME,
  DEMO_CUSTOMER_PASSWORD,
} = process.env;

type DemoAccounts = {
  admin?: {
    username: string;
    password: string;
  };
  customer?: {
    username: string;
    password: string;
  };
};

export function getDemoAccounts(): DemoAccounts {
  const accounts: DemoAccounts = {};

  if (DEMO_ADMIN_USERNAME && DEMO_ADMIN_PASSWORD) {
    accounts.admin = {
      username: DEMO_ADMIN_USERNAME,
      password: DEMO_ADMIN_PASSWORD,
    };
  }

  if (DEMO_CUSTOMER_USERNAME && DEMO_CUSTOMER_PASSWORD) {
    accounts.customer = {
      username: DEMO_CUSTOMER_USERNAME,
      password: DEMO_CUSTOMER_PASSWORD,
    };
  }

  return accounts;
}
