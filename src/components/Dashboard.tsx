import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import { cardShadow, palette } from '../theme';
import { buildCapabilities, globalSettingSections } from '../data/capabilities';
import { buildChangeHistory } from '../data/changeHistory';
import { currentUser } from '../data/people';
import { defaultRetailerId, retailers } from '../data/retailers';
import { CapabilityCard, emptyDraft, type Draft } from './CapabilityCard';
import { ChangeHistoryPanel } from './ChangeHistoryPanel';
import { LeftNav } from './LeftNav';
import { SaveModal, type PendingChange } from './SaveModal';
import type { ConfigValue } from './ConfigFieldRow';
import type { Capability, ChangeEvent, Source } from '../types';

type Scope = 'program' | 'retailer' | 'brand';

function formatValue(value: ConfigValue): string {
  if (value === null || value === undefined || value === '') return '(empty)';
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '(empty)';
  return value;
}

function Tabs({ scope, onChange }: { scope: Scope; onChange: (next: Scope) => void }) {
  const tabs: { id: Scope; label: string }[] = [
    { id: 'program', label: 'Program' },
    { id: 'retailer', label: 'Retailer' },
    { id: 'brand', label: 'Brand' },
  ];
  return (
    // The first tab is flush left with no gap, and tabs are not stretched to fill.
    <Box sx={{ display: 'flex', gap: 4, borderBottom: `1px solid ${palette.border}` }}>
      {tabs.map((tab) => {
        const selected = tab.id === scope;
        return (
          <Box
            key={tab.id}
            component="button"
            type="button"
            onClick={() => onChange(tab.id)}
            sx={{
              background: 'none',
              border: 'none',
              borderBottom: selected ? `2px solid ${palette.textPrimary}` : '2px solid transparent',
              mb: '-1px',
              px: 0,
              py: 1.5,
              font: 'inherit',
              fontSize: 14,
              fontWeight: selected ? 700 : 400,
              color: selected ? 'text.primary' : palette.textSecondary,
              cursor: 'pointer',
              '&:hover': selected ? {} : { color: 'text.primary' },
            }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );
}

function EmptyScope() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: cardShadow,
        p: 6,
        textAlign: 'center',
      }}
    >
      <Typography variant="h2">Coming next</Typography>
      <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 1 }}>
        Settings at this level are still being defined.
      </Typography>
    </Box>
  );
}

function GlobalSettingCard({
  section,
  cardRef,
}: {
  section: { id: string; name: string };
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <Box
      ref={cardRef}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: cardShadow,
        p: 3,
        scrollMarginTop: 24,
      }}
    >
      <Typography variant="h2">{section.name}</Typography>
      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
        Retailer global setting · Details in next iteration
      </Typography>
    </Box>
  );
}

export function Dashboard() {
  const [scope, setScope] = useState<Scope>('retailer');
  const [retailerId, setRetailerId] = useState(defaultRetailerId);

  const [capabilities, setCapabilities] = useState<Capability[]>(() => buildCapabilities(defaultRetailerId));
  const [history, setHistory] = useState<ChangeEvent[]>(() => buildChangeHistory(defaultRetailerId));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [expandedIds, setExpandedIds] = useState<string[]>(['meta']);
  const [selectedNavId, setSelectedNavId] = useState<string | null>('meta');
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'capability'>('all');
  const [saveTarget, setSaveTarget] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const pendingFocus = useRef<string | null>(null);

  // Switching retailer resets to that retailer's seeded mock state.
  useEffect(() => {
    setCapabilities(buildCapabilities(retailerId));
    setHistory(buildChangeHistory(retailerId));
    setDrafts({});
    setExpandedIds(['meta']);
    setSelectedNavId('meta');
  }, [retailerId]);

  const retailer = retailers.find((r) => r.id === retailerId)!;

  const getDraft = useCallback((id: string) => drafts[id] ?? emptyDraft, [drafts]);

  const scrollTo = useCallback((id: string) => {
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  function handleNavSelect(id: string) {
    setSelectedNavId(id);
    const isCapability = capabilities.some((c) => c.id === id);
    if (isCapability && !expandedIds.includes(id)) setExpandedIds([...expandedIds, id]);
    requestAnimationFrame(() => scrollTo(id));
  }

  function toggleExpanded(id: string) {
    setSelectedNavId(id);
    setExpandedIds(expandedIds.includes(id) ? expandedIds.filter((e) => e !== id) : [...expandedIds, id]);
  }

  function handleFeatureChange(capabilityId: string, key: string, next: boolean) {
    setDrafts((prev) => {
      const draft = prev[capabilityId] ?? emptyDraft;
      const capability = capabilities.find((c) => c.id === capabilityId)!;
      const feature = capability.features.find((f) => f.key === key)!;
      const savedOn = feature.state === 'live' || feature.state === 'pending';
      const features = { ...draft.features };
      if (next === savedOn) delete features[key];
      else features[key] = next;
      return { ...prev, [capabilityId]: { ...draft, features } };
    });
  }

  function handleConfigChange(capabilityId: string, key: string, next: ConfigValue) {
    setDrafts((prev) => {
      const draft = prev[capabilityId] ?? emptyDraft;
      const capability = capabilities.find((c) => c.id === capabilityId)!;
      const field = capability.configs.find((f) => f.key === key)!;
      const configs = { ...draft.configs };
      if (formatValue(next) === formatValue(field.value)) delete configs[key];
      else configs[key] = next;
      return { ...prev, [capabilityId]: { ...draft, configs } };
    });
  }

  function discard(capabilityId: string) {
    setDrafts((prev) => ({ ...prev, [capabilityId]: emptyDraft }));
  }

  const pendingChanges: PendingChange[] = useMemo(() => {
    if (!saveTarget) return [];
    const capability = capabilities.find((c) => c.id === saveTarget);
    const draft = drafts[saveTarget] ?? emptyDraft;
    if (!capability) return [];

    const featureChanges = Object.entries(draft.features).map(([key, value]) => {
      const feature = capability.features.find((f) => f.key === key)!;
      return {
        key,
        label: feature.label,
        from: feature.state === 'live' ? 'On' : feature.state === 'pending' ? 'Pending' : 'Off',
        to: value ? 'On' : 'Off',
      };
    });

    const configChanges = Object.entries(draft.configs).map(([key, value]) => {
      const field = capability.configs.find((f) => f.key === key)!;
      return { key, label: field.label, from: formatValue(field.value), to: formatValue(value) };
    });

    return [...featureChanges, ...configChanges];
  }, [saveTarget, capabilities, drafts]);

  function confirmSave() {
    if (!saveTarget) return;
    const capabilityId = saveTarget;
    const draft = drafts[capabilityId] ?? emptyDraft;
    const now = new Date().toISOString();

    setCapabilities((prev) =>
      prev.map((capability) => {
        if (capability.id !== capabilityId) return capability;

        const features = capability.features.map((feature) =>
          feature.key in draft.features
            ? { ...feature, state: 'pending' as const, declinedBy: undefined, declinedReason: undefined }
            : feature,
        );

        const configs = capability.configs.map((field) =>
          field.key in draft.configs
            ? {
                ...field,
                value: draft.configs[field.key]!,
                state: 'pending' as const,
                declinedBy: undefined,
                declinedReason: undefined,
              }
            : field,
        );

        // Prerequisite checks recompute off the saved values, so entering an ad
        // account ID flips its check as soon as the change is saved.
        const prerequisites = capability.prerequisites.map((check) => {
          if (!check.fixesFieldKey) return check;
          const field = configs.find((f) => f.key === check.fixesFieldKey);
          if (!field) return check;
          const filled = !(field.value === null || field.value === '' ||
            (Array.isArray(field.value) && field.value.length === 0));
          return { ...check, passed: filled };
        });

        return { ...capability, features, configs, prerequisites };
      }),
    );

    const capability = capabilities.find((c) => c.id === capabilityId)!;
    const newEvents: ChangeEvent[] = pendingChanges.map((change, index) => {
      const feature = capability.features.find((f) => f.key === change.key);
      const field = capability.configs.find((f) => f.key === change.key);
      const source: Source = feature ? 'LaunchDarkly' : (field?.source ?? 'AppConfig');
      return {
        id: `local-${Date.now()}-${index}`,
        capabilityId,
        settingKey: change.key,
        settingLabel: change.label,
        from: change.from,
        to: change.to,
        requestedBy: currentUser.name,
        status: 'pending',
        source,
        timestamp: now,
      };
    });

    setHistory((prev) => [...newEvents, ...prev]);
    setDrafts((prev) => ({ ...prev, [capabilityId]: emptyDraft }));
    setSaveTarget(null);
  }

  // "Go to setting" scrolls to and focuses the field that fixes a failed check.
  useEffect(() => {
    if (!pendingFocus.current) return;
    const node = fieldRefs.current[pendingFocus.current];
    pendingFocus.current = null;
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node.focus({ preventScroll: true });
  });

  function focusField(key: string) {
    pendingFocus.current = key;
    const node = fieldRefs.current[key];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  }

  function goToGlobalSection(sectionId: string) {
    setSelectedNavId(sectionId);
    scrollTo(sectionId);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1920, minWidth: 1280, mx: 'auto', px: 4, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
          <Box>
            <Typography variant="h1">Retailer configuration</Typography>
            <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 1 }}>
              {retailer.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <Select
              size="small"
              value={retailerId}
              onChange={(e) => setRetailerId(e.target.value)}
              sx={{ minWidth: 220, bgcolor: 'background.paper' }}
            >
              {retailers.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
            <Tabs scope={scope} onChange={setScope} />
          </Box>
        </Box>

        <Box sx={{ mt: '36px' }}>
          {scope !== 'retailer' ? (
            <EmptyScope />
          ) : (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 240,
                  flexShrink: 0,
                  position: 'sticky',
                  top: 24,
                  maxHeight: 'calc(100vh - 48px)',
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                <LeftNav capabilities={capabilities} selectedId={selectedNavId} onSelect={handleNavSelect} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {globalSettingSections.map((section) => (
                  <GlobalSettingCard
                    key={section.id}
                    section={section}
                    cardRef={(node) => {
                      cardRefs.current[section.id] = node;
                    }}
                  />
                ))}

                {capabilities.map((capability) => (
                  <CapabilityCard
                    key={capability.id}
                    capability={capability}
                    expanded={expandedIds.includes(capability.id)}
                    onToggleExpanded={() => toggleExpanded(capability.id)}
                    draft={getDraft(capability.id)}
                    onFeatureChange={(key, next) => handleFeatureChange(capability.id, key, next)}
                    onConfigChange={(key, next) => handleConfigChange(capability.id, key, next)}
                    onSave={() => setSaveTarget(capability.id)}
                    onDiscard={() => discard(capability.id)}
                    onGoToGlobalSection={goToGlobalSection}
                    registerFieldRef={(key, node) => {
                      fieldRefs.current[key] = node;
                    }}
                    focusField={focusField}
                    cardRef={(node) => {
                      cardRefs.current[capability.id] = node;
                    }}
                  />
                ))}
              </Box>

              <ChangeHistoryPanel
                events={history}
                activeCapabilityId={selectedNavId}
                collapsed={historyCollapsed}
                onToggleCollapsed={() => setHistoryCollapsed(!historyCollapsed)}
                filter={historyFilter}
                onFilterChange={setHistoryFilter}
              />
            </Box>
          )}
        </Box>
      </Box>

      <SaveModal
        open={saveTarget !== null}
        changes={pendingChanges}
        onCancel={() => setSaveTarget(null)}
        onConfirm={confirmSave}
      />
    </Box>
  );
}
