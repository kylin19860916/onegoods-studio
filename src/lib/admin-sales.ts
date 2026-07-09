import Stripe from "stripe";
import { Resend } from "resend";

export type AdminOrder = {
  id: string;
  created: string;
  customerEmail: string;
  customerName: string;
  country: string;
  productName: string;
  productSlug: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  status: string;
  url: string;
};

export type AdminOrdersResult = {
  configured: boolean;
  error?: string;
  orders: AdminOrder[];
  stats: {
    orderCount: number;
    last7DaysCount: number;
    revenueByCurrency: Record<string, number>;
  };
};

export type AdminCustomer = {
  email: string;
  name: string;
  country: string;
  orderCount: number;
  lastOrderAt: string;
  spendByCurrency: Record<string, number>;
};

export type AdminSubscriber = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  unsubscribed: boolean;
};

export type AdminCustomersResult = {
  stripeConfigured: boolean;
  resendConfigured: boolean;
  error?: string;
  customers: AdminCustomer[];
  subscribers: AdminSubscriber[];
  stats: {
    buyerCount: number;
    subscriberCount: number;
    activeSubscriberCount: number;
  };
};

function emptyOrders(configured = false, error?: string): AdminOrdersResult {
  return {
    configured,
    error,
    orders: [],
    stats: {
      orderCount: 0,
      last7DaysCount: 0,
      revenueByCurrency: {},
    },
  };
}

function centsToMajor(amount: number | null | undefined) {
  return Number(((amount ?? 0) / 100).toFixed(2));
}

function getSessionEmail(session: Stripe.Checkout.Session) {
  return session.customer_details?.email ?? session.customer_email ?? "";
}

function getSessionName(session: Stripe.Checkout.Session) {
  return session.customer_details?.name ?? "";
}

function getSessionCountry(session: Stripe.Checkout.Session) {
  return session.customer_details?.address?.country ?? "";
}

function getSessionProductName(session: Stripe.Checkout.Session) {
  const lineItems = session.line_items?.data ?? [];
  return lineItems[0]?.description ?? "OneGoods order";
}

function toOrder(session: Stripe.Checkout.Session): AdminOrder {
  const currency = (session.currency ?? "usd").toUpperCase();
  return {
    id: session.id,
    created: new Date(session.created * 1000).toISOString(),
    customerEmail: getSessionEmail(session),
    customerName: getSessionName(session),
    country: getSessionCountry(session),
    productName: getSessionProductName(session),
    productSlug: String(session.metadata?.product_slug ?? ""),
    amountTotal: centsToMajor(session.amount_total),
    currency,
    paymentStatus: session.payment_status,
    status: session.status ?? "unknown",
    url: session.url ?? "",
  };
}

export async function getAdminOrders(limit = 100): Promise<AdminOrdersResult> {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return emptyOrders(false);

  try {
    const stripe = new Stripe(stripeSecret);
    const sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ["data.line_items"],
    });

    const orders = sessions.data.map(toOrder);
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const revenueByCurrency = paidOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.currency] = Number(((acc[order.currency] ?? 0) + order.amountTotal).toFixed(2));
      return acc;
    }, {});

    return {
      configured: true,
      orders,
      stats: {
        orderCount: paidOrders.length,
        last7DaysCount: paidOrders.filter((order) => new Date(order.created).getTime() >= sevenDaysAgo).length,
        revenueByCurrency,
      },
    };
  } catch (error) {
    return emptyOrders(true, error instanceof Error ? error.message : "Unable to read Stripe orders.");
  }
}

export async function getAdminCustomers(limit = 100): Promise<AdminCustomersResult> {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const stripeConfigured = Boolean(stripeSecret);
  const resendConfigured = Boolean(resendKey && audienceId);

  let ordersResult = emptyOrders(stripeConfigured);
  let subscribers: AdminSubscriber[] = [];
  const errors: string[] = [];

  if (stripeSecret) {
    ordersResult = await getAdminOrders(limit);
    if (ordersResult.error) errors.push(`Stripe: ${ordersResult.error}`);
  }

  if (resendKey && audienceId) {
    try {
      const resend = new Resend(resendKey);
      const contacts = await resend.contacts.list({ audienceId, limit });
      if (contacts.error) {
        errors.push(`Resend: ${contacts.error.message}`);
      } else {
        subscribers = contacts.data.data.map((contact) => ({
          id: contact.id,
          email: contact.email,
          name: [contact.first_name, contact.last_name].filter(Boolean).join(" "),
          createdAt: contact.created_at,
          unsubscribed: contact.unsubscribed,
        }));
      }
    } catch (error) {
      errors.push(`Resend: ${error instanceof Error ? error.message : "Unable to read contacts."}`);
    }
  }

  const customersByEmail = new Map<string, AdminCustomer>();
  for (const order of ordersResult.orders.filter((item) => item.paymentStatus === "paid" && item.customerEmail)) {
    const email = order.customerEmail.toLowerCase();
    const current = customersByEmail.get(email) ?? {
      email,
      name: order.customerName,
      country: order.country,
      orderCount: 0,
      lastOrderAt: order.created,
      spendByCurrency: {},
    };

    current.name ||= order.customerName;
    current.country ||= order.country;
    current.orderCount += 1;
    current.spendByCurrency[order.currency] = Number(((current.spendByCurrency[order.currency] ?? 0) + order.amountTotal).toFixed(2));
    if (new Date(order.created).getTime() > new Date(current.lastOrderAt).getTime()) {
      current.lastOrderAt = order.created;
    }
    customersByEmail.set(email, current);
  }

  const customers = Array.from(customersByEmail.values()).sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
  );

  return {
    stripeConfigured,
    resendConfigured,
    error: errors.length ? errors.join(" / ") : undefined,
    customers,
    subscribers,
    stats: {
      buyerCount: customers.length,
      subscriberCount: subscribers.length,
      activeSubscriberCount: subscribers.filter((subscriber) => !subscriber.unsubscribed).length,
    },
  };
}

export function formatMoneyByCurrency(values: Record<string, number>) {
  const entries = Object.entries(values);
  if (!entries.length) return "-";
  return entries.map(([currency, amount]) => `${currency} ${amount.toLocaleString()}`).join(" / ");
}
