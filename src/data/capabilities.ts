import type { Capability, ConfigField, Feature, PrerequisiteCheck } from '../types';

export const navGroups = [
  'Retailer global settings',
  'Channels',
  'On-site',
  'Targeting & products',
  'Creative',
  'Insights & reporting',
  'Planning',
  'Integrations',
] as const;

/** Sections of Retailer global settings. Listed first, and not capability cards. */
export const globalSettingSections = [
  { id: 'identity-locale', name: 'Identity & locale' },
  { id: 'users-access', name: 'Users & access' },
  { id: 'support-legal', name: 'Support & legal' },
  { id: 'campaign-rules', name: 'Campaign rules' },
  { id: 'billing', name: 'Billing' },
  { id: 'campaign-workflow', name: 'Campaign workflow' },
];

type PlaceholderSpec = {
  id: string;
  name: string;
  subtitle?: string;
  navGroup: string;
  live?: boolean;
  available?: boolean;
};

const placeholderSpecs: PlaceholderSpec[] = [
  { id: 'google', name: 'Google', subtitle: 'Search, Shopping and YouTube', navGroup: 'Channels', live: true },
  { id: 'pinterest', name: 'Pinterest', subtitle: 'Pinterest ads', navGroup: 'Channels' },
  { id: 'reddit', name: 'Reddit', subtitle: 'Reddit ads', navGroup: 'Channels', available: false },
  {
    id: 'onsite-advertising',
    name: 'On-site advertising',
    subtitle: 'Sponsored placements on the retailer site',
    navGroup: 'On-site',
    live: true,
  },
  { id: 'audiences', name: 'Audiences', subtitle: 'Segments and targeting', navGroup: 'Targeting & products', live: true },
  {
    id: 'products-catalogs',
    name: 'Products & catalogs',
    subtitle: 'Product feeds and catalog sync',
    navGroup: 'Targeting & products',
    live: true,
  },
  { id: 'creative', name: 'Creative', subtitle: 'Asset library and ad builder', navGroup: 'Creative', live: true },
  { id: 'insights-console', name: 'Insights Console', subtitle: 'Standard reporting', navGroup: 'Insights & reporting', live: true },
  { id: 'insights-explorer', name: 'Insights Explorer', subtitle: 'Ad hoc analysis', navGroup: 'Insights & reporting' },
  {
    id: 'data-attribution',
    name: 'Data & attribution',
    subtitle: 'Measurement windows and models',
    navGroup: 'Insights & reporting',
    live: true,
  },
  { id: 'media-planner', name: 'Media Planner', subtitle: 'Plan and forecast spend', navGroup: 'Planning' },
  { id: 'other-integrations', name: 'Other integrations', subtitle: 'Partner and data connections', navGroup: 'Integrations' },
];

function placeholder(spec: PlaceholderSpec): Capability {
  const available = spec.available !== false;
  return {
    id: spec.id,
    name: spec.name,
    subtitle: spec.subtitle,
    navGroup: spec.navGroup,
    available,
    masterFeatureKey: available ? spec.id : undefined,
    features: available
      ? [
          {
            key: spec.id,
            label: `${spec.name} campaigns`,
            state: spec.live ? 'live' : 'off',
            description: `Master switch for ${spec.name}.`,
          },
        ]
      : [],
    configs: [],
    prerequisites: [],
    codeNotes: [],
    detailed: false,
  };
}

const metaPrerequisites = (adAccountId: string | null, metaToggleLive: boolean): PrerequisiteCheck[] => [
  {
    key: 'meta-toggle',
    label: 'meta toggle is on',
    passed: metaToggleLive,
    pending: !metaToggleLive,
    source: 'LaunchDarkly',
    explanation: 'Requested, waiting for approval in LaunchDarkly',
  },
  {
    key: 'allowed-on-facebook',
    label: 'Allowed on Facebook (allowed_on_facebook)',
    passed: true,
    source: 'Database',
    explanation: 'Database kill switch. Off means no Meta at all.',
    fixesGlobalSection: 'campaign-rules',
  },
  {
    key: 'store-category',
    label: 'Store category is Meta-eligible',
    passed: true,
    source: 'Database',
    explanation: 'Some store categories are blocked from Facebook.',
    fixesGlobalSection: 'identity-locale',
  },
  {
    key: 'adplatformconfig',
    label: 'Meta enabled in AdPlatformConfig',
    passed: true,
    source: 'AppConfig',
    explanation: 'Must agree with the toggle or Meta is half-broken.',
  },
  {
    key: 'ad-account-id',
    label: 'Ad account ID is set',
    passed: Boolean(adAccountId),
    source: 'Database',
    explanation: "Campaigns can't publish without an ad account.",
    fixesFieldKey: 'ad_account_id',
  },
];

const metaFeatures = (masterState: Feature['state']): Feature[] => [
  {
    key: 'meta',
    label: 'Meta campaigns',
    state: masterState,
    description: 'Prerequisite for every other Meta feature.',
  },
  {
    key: 'static_ads',
    label: 'Static ads',
    state: masterState === 'live' ? 'live' : 'off',
    prerequisiteKey: 'meta',
    description: 'Single-image ad formats.',
  },
  {
    key: 'ad_edit',
    label: 'Ad editing',
    state: masterState === 'live' ? 'live' : 'off',
    prerequisiteKey: 'meta',
    description: 'Lets advertisers edit ads after launch.',
  },
  {
    key: 'fb_marketing',
    label: 'Marketing package campaigns',
    // Declined rather than off, so the fourth toggle state is visible in the prototype
    // alongside its matching entry in the change history.
    state: 'declined',
    prerequisiteKey: 'meta',
    description: 'Bundled marketing package buys.',
    declinedBy: 'Owen Fitzgerald',
    declinedReason: 'Marketing packages are not contracted for this retailer yet',
  },
];

type MetaConfigOverrides = {
  adAccountId: string | null;
  linkDescription: string;
  geoCountry: string;
  pageName: string;
  businessManagerId: string;
  pixelId: string;
  catalogId: string;
  facebookPages: string[];
};

const metaConfigs = (o: MetaConfigOverrides): ConfigField[] => [
  // Builder (source: App Config)
  {
    key: 'meta_ad_types',
    label: 'Meta ad types',
    group: 'Builder',
    inputType: 'multiselect',
    options: ['META', 'FACEBOOK', 'INSTAGRAM', 'AUDIENCE_NETWORK'],
    value: ['META'],
    state: 'saved',
    source: 'AppConfig',
    required: 'BreaksFeature',
    description: 'Which Meta ad types the builder offers.',
  },
  {
    key: 'builder_steps',
    label: 'Builder steps',
    group: 'Builder',
    inputType: 'multiselect',
    options: ['Name', 'Budget', 'Audiences', 'Geo', 'Ads', 'Taxonomy', 'Billing', 'Creative', 'Review'],
    value: ['Name', 'Budget', 'Audiences', 'Geo', 'Ads', 'Taxonomy', 'Billing'],
    state: 'saved',
    source: 'AppConfig',
    required: 'BlocksPublishing',
    description: 'Steps shown in the campaign builder, in order.',
  },
  {
    key: 'cant_be_combined_with',
    label: "Can't be combined with",
    group: 'Builder',
    inputType: 'multiselect',
    options: ['Google', 'Pinterest', 'Reddit', 'On-site'],
    value: ['Google'],
    state: 'saved',
    source: 'AppConfig',
    required: 'Optional',
    description: 'Channels that cannot share a campaign with Meta.',
  },

  // Defaults (source: App Config; social_configuration)
  {
    key: 'default_page_name',
    label: 'Default page name',
    group: 'Defaults',
    inputType: 'text',
    value: o.pageName || null,
    state: 'saved',
    source: 'AppConfig',
    required: 'Optional',
    description: 'Page name prefilled on new campaigns.',
  },
  {
    key: 'default_link_description',
    label: 'Default link description',
    group: 'Defaults',
    inputType: 'text',
    value: o.linkDescription,
    state: 'saved',
    source: 'AppConfig',
    required: 'Optional',
    description: 'Text under the link in the ad unit.',
  },
  {
    key: 'custom_event_type',
    label: 'Custom event type',
    group: 'Defaults',
    inputType: 'select',
    options: ['CONTENT_VIEW', 'ADD_TO_CART', 'PURCHASE', 'LEAD', 'SEARCH'],
    value: 'CONTENT_VIEW',
    state: 'saved',
    source: 'AppConfig',
    required: 'BreaksFeature',
    description: 'Pixel event optimised against by default.',
  },
  {
    key: 'prospecting_optimization_goal',
    label: 'Prospecting optimization goal',
    group: 'Defaults',
    inputType: 'select',
    options: ['OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'REACH', 'IMPRESSIONS', 'LANDING_PAGE_VIEWS'],
    value: 'OFFSITE_CONVERSIONS',
    state: 'saved',
    source: 'AppConfig',
    required: 'BreaksFeature',
    description: 'Delivery goal for prospecting ad sets.',
  },
  {
    key: 'retargeting_optimization_goal',
    label: 'Retargeting optimization goal',
    group: 'Defaults',
    inputType: 'select',
    options: ['OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'REACH', 'IMPRESSIONS', 'LANDING_PAGE_VIEWS'],
    value: 'OFFSITE_CONVERSIONS',
    state: 'saved',
    source: 'AppConfig',
    required: 'BreaksFeature',
    description: 'Delivery goal for retargeting ad sets.',
  },
  {
    key: 'lookalike_audience_size',
    label: 'Lookalike audience size',
    group: 'Defaults',
    inputType: 'select',
    options: ['1%', '2%', '3%', '5%', '10%'],
    value: null,
    state: 'saved',
    source: 'AppConfig',
    required: 'Optional',
    description: 'Default lookalike expansion percentage.',
  },
  {
    key: 'use_retailer_facebook_page',
    label: 'Use retailer Facebook Page',
    group: 'Defaults',
    inputType: 'toggle',
    value: false,
    state: 'saved',
    source: 'AppConfig',
    required: 'Optional',
    description: "Publish from the retailer's Page instead of the brand's.",
  },
  {
    key: 'default_facebook_geo_country',
    label: 'Default Facebook geo country',
    group: 'Defaults',
    inputType: 'select',
    options: ['US', 'CA', 'UK', 'MX'],
    value: o.geoCountry,
    state: 'saved',
    source: 'AppConfig',
    required: 'BreaksFeature',
    description: 'Country applied when a campaign sets no geo.',
  },

  // Accounts (source: Database)
  {
    key: 'business_manager_id',
    label: 'Business Manager ID',
    group: 'Accounts',
    inputType: 'text',
    value: o.businessManagerId,
    state: 'saved',
    source: 'Database',
    required: 'BlocksPublishing',
    description: 'Meta Business Manager that owns the assets.',
  },
  {
    key: 'ad_account_id',
    label: 'Ad account ID',
    group: 'Accounts',
    inputType: 'text',
    value: o.adAccountId,
    state: 'saved',
    source: 'Database',
    required: 'BlocksPublishing',
    description: 'Ad account campaigns are published into.',
  },
  {
    key: 'pixel_id',
    label: 'Pixel ID',
    group: 'Accounts',
    inputType: 'text',
    value: o.pixelId,
    state: 'saved',
    source: 'Database',
    required: 'BreaksFeature',
    description: 'Measurement. Without it conversions are not tracked.',
  },
  {
    key: 'product_catalog_id',
    label: 'Product catalog ID',
    group: 'Accounts',
    inputType: 'text',
    value: o.catalogId,
    state: 'saved',
    source: 'Database',
    required: 'BreaksFeature',
    description: 'Product ads. Without it dynamic formats are unavailable.',
  },
  {
    key: 'facebook_pages',
    label: 'Facebook Pages',
    group: 'Accounts',
    inputType: 'multiselect',
    options: ['Ulta Beauty', 'Ulta Beauty Canada', 'The Home Depot', 'The Home Depot Canada'],
    value: o.facebookPages,
    state: 'saved',
    source: 'Database',
    required: 'BreaksFeature',
    description: 'Pages ads can be published from. The first is primary.',
  },
];

export const configGroupOrder = ['Builder', 'Defaults', 'Accounts'];

function metaCapability(retailerId: string): Capability {
  // The Home Depot US is seeded as a complete setup so the Live state can be demoed
  // alongside Ulta's Pending state. Every other retailer starts fully off (Incomplete/Off).
  const isThdUs = retailerId === 'thd-us';
  const isUlta = retailerId === 'ulta';

  const masterState: Feature['state'] = isThdUs ? 'live' : isUlta ? 'pending' : 'off';
  const adAccountId = isThdUs ? 'act-4455667788' : null;

  return {
    id: 'meta',
    name: 'Meta',
    subtitle: 'Facebook and Instagram ads',
    navGroup: 'Channels',
    available: true,
    masterFeatureKey: 'meta',
    features: metaFeatures(masterState),
    configs: metaConfigs({
      adAccountId,
      linkDescription: isThdUs ? 'homedepot.com' : 'ulta.com',
      geoCountry: 'US',
      pageName: '',
      businessManagerId: isThdUs ? '2233445566' : '1234567890',
      pixelId: isThdUs ? '8877665544' : '9876543210',
      catalogId: isThdUs ? '5551112222' : '5550001111',
      facebookPages: isThdUs ? ['The Home Depot'] : ['Ulta Beauty'],
    }),
    prerequisites: metaPrerequisites(adAccountId, masterState === 'live'),
    codeNotes: ['Handled by engineering: brand onboarding playbook.'],
    detailed: true,
  };
}

export function buildCapabilities(retailerId: string): Capability[] {
  return [metaCapability(retailerId), ...placeholderSpecs.map(placeholder)];
}
