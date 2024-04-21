import { type ObjectType } from "@/lib/types/helper";

export const ACCOUNT_TIER = {
  BASIC: "basic",
  PREMIUM: "premium",
};

export type AccountTier = ObjectType<typeof ACCOUNT_TIER>;

type ProductTierContent = {
  maximumProduct?: number;
  imagePerProduct?: number;
};

export const PRODUCT_TIER_CONTENT: {
  [key in AccountTier]: ProductTierContent;
} = {
  [ACCOUNT_TIER.BASIC]: {
    maximumProduct: 5,
  },
  [ACCOUNT_TIER.PREMIUM]: {
    imagePerProduct: 5,
  },
};

type EventTierContent = {
  eventWithImage?: boolean;
  maximumEvent?: number;
  productPerEvent?: number;
};

export const EVENT_TIER_CONTENT: {
  [key in AccountTier]: EventTierContent;
} = {
  [ACCOUNT_TIER.BASIC]: {
    maximumEvent: 1,
    productPerEvent: 5,
  },
  [ACCOUNT_TIER.PREMIUM]: {
    eventWithImage: true,
  },
};
