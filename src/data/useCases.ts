import type { ConfigField, UseCase } from '../types';

/** Adds a channel to the retailer's allowed channels without dropping the ones already there. */
const allowChannel = (channel: string) => (_retailer: unknown, current: ConfigField['value']) => {
  const list = Array.isArray(current) ? current : [];
  return list.includes(channel) ? list : [...list, channel];
};

export const useCases: UseCase[] = [
  {
    id: 'standard-meta',
    name: 'Standard Meta Configuration',
    description: 'Turn on Meta with static ads and the usual retailer settings.',
    features: [
      { ownerId: 'meta', key: 'meta' },
      { ownerId: 'meta', key: 'static_ads' },
      { ownerId: 'meta', key: 'ad_edit' },
    ],
    globalFields: [
      { ownerId: 'campaign-rules', key: 'allowed_on_facebook', value: true },
      { ownerId: 'campaign-rules', key: 'allowed_channels', value: allowChannel('Meta') },
      { ownerId: 'identity-locale', key: 'default_currency' },
      { ownerId: 'campaign-rules', key: 'min_campaign_budget', value: '500' },
    ],
    channelFields: [
      { ownerId: 'meta', key: 'meta_ad_types', value: ['META'] },
      { ownerId: 'meta', key: 'default_page_name', value: (retailer) => retailer.name },
      { ownerId: 'meta', key: 'ad_account_id' },
    ],
  },
  {
    id: 'pinterest-shopping',
    name: 'Pinterest Shopping Launch',
    description: 'Turn on Pinterest with catalog-driven Shopping ads.',
    features: [
      { ownerId: 'pinterest', key: 'pinterest' },
      { ownerId: 'pinterest', key: 'pinterest_shopping' },
    ],
    globalFields: [
      { ownerId: 'campaign-rules', key: 'allowed_channels', value: allowChannel('Pinterest') },
      { ownerId: 'identity-locale', key: 'supported_countries' },
    ],
    channelFields: [
      { ownerId: 'pinterest', key: 'pinterest_objective', value: 'CATALOG_SALES' },
      { ownerId: 'pinterest', key: 'pinterest_advertiser_id' },
      { ownerId: 'pinterest', key: 'pinterest_catalog_id' },
    ],
  },
  {
    id: 'google-shopping',
    name: 'Google Shopping',
    description: 'Add Shopping and Performance Max to an existing Google setup.',
    features: [
      { ownerId: 'google', key: 'google' },
      { ownerId: 'google', key: 'google_shopping' },
      { ownerId: 'google', key: 'google_pmax' },
    ],
    globalFields: [
      { ownerId: 'campaign-rules', key: 'allowed_channels', value: allowChannel('Google') },
      { ownerId: 'identity-locale', key: 'default_currency' },
    ],
    channelFields: [
      { ownerId: 'google', key: 'google_campaign_types', value: ['SEARCH', 'SHOPPING', 'PERFORMANCE_MAX'] },
      { ownerId: 'google', key: 'merchant_center_id' },
    ],
  },
];
