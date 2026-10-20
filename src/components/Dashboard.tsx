import { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Collapse, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { cardShadow, palette } from '../theme';
import { buildCapabilities, configGroups, globalSettingSections } from '../data/capabilities';
import { buildChangeHistory } from '../data/changeHistory';
import { currentUser } from '../data/people';
import { defaultRetailerId } from '../data/retailers';
import { isEmptyValue } from '../logic/status';
import { CapabilityCard, emptyDraft, type Draft } from './CapabilityCard';
import { CardChangeHistory } from './ChangeHistoryPanel';
import { ConfigFieldGroup } from './ConfigFieldGroup';
import { type ConfigValue } from './ConfigFieldRow';
import { LeftNav } from './LeftNav';
import { SaveModal, type PendingChange } from './SaveModal';
import { Banner, PendingPill, SectionHeading, UnsavedBar } from './ui';
import type { Capability, ChangeEvent, GlobalSection, Source } from '../types';

type Scope = 'program' | 'retailer' | 'brand';

const globalSettingsGroup = 'Retailer global settings';

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
  events,
  expanded,
  onToggleExpanded,
  draft,
  onConfigChange,
  onSave,
  onDiscard,
  onAddNote,
  registerFieldRef,
  cardRef,
}: {
  section: GlobalSection;
  events: ChangeEvent[];
  expanded: boolean;
  onToggleExpanded: () => void;
  draft: Draft;
  onConfigChange: (key: string, next: ConfigValue) => void;
  onSave: () => void;
  onDiscard: () => void;
  onAddNote: (body: string) => void;
  registerFieldRef: (key: string, node: HTMLElement | null) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const unsavedCount = Object.keys(draft.configs).length;
  const pending = section.configs.filter((field) => field.state === 'pending').length;
  const missing = section.configs.filter(
    (field) => field.required === 'BlocksPublishing' && isEmptyValue(field.value),
  );

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
      <Box
        component="button"
        type="button"
        onClick={onToggleExpanded}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          width: '100%',
          background: 'none',
          border: 'none',
          p: 0,
          font: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h2">{section.name}</Typography>
            {pending > 0 && <PendingPill>{pending} pending</PendingPill>}
          </Box>
          <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
            {section.description}
          </Typography>
          <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
            {section.configs.length} settings
            {missing.length > 0 ? ` · ${missing.length} required setting${missing.length === 1 ? '' : 's'} empty` : ''}
          </Typography>
        </Box>
        <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} style={{ fontSize: 16 }} />
      </Box>

      <Collapse in={expanded} unmountOnExit>
        {/* Full-bleed rule separating the card header from its body. */}
        <Divider sx={{ mt: 2, mx: -3 }} />
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {missing.length > 0 && (
            <Banner kind="warning">
              {missing.map((field) => field.label).join(', ')} {missing.length === 1 ? 'is' : 'are'} empty. Campaigns
              can't publish until {missing.length === 1 ? 'it is' : 'they are'} set.
            </Banner>
          )}

          {configGroups(section.configs).map((group) => (
            <Box key={group}>
              <SectionHeading>{group}</SectionHeading>
              <Box sx={{ mt: 1.5 }}>
                <ConfigFieldGroup
                  fields={section.configs.filter((field) => field.group === group)}
                  draftConfigs={draft.configs}
                  onChange={onConfigChange}
                  registerFieldRef={registerFieldRef}
                />
              </Box>
            </Box>
          ))}
          </Box>

          <CardChangeHistory
            events={events}
            collapsed={historyCollapsed}
            onToggleCollapsed={() => setHistoryCollapsed(!historyCollapsed)}
            onAddNote={onAddNote}
          />
        </Box>

        {unsavedCount > 0 && <UnsavedBar count={unsavedCount} onDiscard={onDiscard} onSave={onSave} />}
      </Collapse>
    </Box>
  );
}

export function Dashboard() {
  const [scope, setScope] = useState<Scope>('retailer');

  const [capabilities, setCapabilities] = useState<Capability[]>(() => buildCapabilities(defaultRetailerId));
  const [sections, setSections] = useState<GlobalSection[]>(globalSettingSections);
  const [history, setHistory] = useState<ChangeEvent[]>(() => buildChangeHistory(defaultRetailerId));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [expandedIds, setExpandedIds] = useState<string[]>(['meta']);
  const [selectedNavId, setSelectedNavId] = useState<string | null>('meta');
  const [selectedGroup, setSelectedGroup] = useState<string>('Channels');
  const [saveTarget, setSaveTarget] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const getDraft = useCallback((id: string) => drafts[id] ?? emptyDraft, [drafts]);

  const scrollTo = useCallback((id: string) => {
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  function handleNavSelect(id: string) {
    setSelectedNavId(id);
    const capability = capabilities.find((c) => c.id === id);
    setSelectedGroup(capability ? capability.navGroup : globalSettingsGroup);
    if (!expandedIds.includes(id)) setExpandedIds([...expandedIds, id]);
    requestAnimationFrame(() => scrollTo(id));
  }

  function handleGroupSelect(group: string) {
    setSelectedGroup(group);
    setSelectedNavId(null);
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

  /** Config fields of a capability card or a global settings card. */
  function configsOf(ownerId: string) {
    const capability = capabilities.find((c) => c.id === ownerId);
    if (capability) return capability.configs;
    return sections.find((s) => s.id === ownerId)?.configs ?? [];
  }

  function handleConfigChange(ownerId: string, key: string, next: ConfigValue) {
    setDrafts((prev) => {
      const draft = prev[ownerId] ?? emptyDraft;
      const field = configsOf(ownerId).find((f) => f.key === key)!;
      const configs = { ...draft.configs };
      if (formatValue(next) === formatValue(field.value)) delete configs[key];
      else configs[key] = next;
      return { ...prev, [ownerId]: { ...draft, configs } };
    });
  }

  function discard(capabilityId: string) {
    setDrafts((prev) => ({ ...prev, [capabilityId]: emptyDraft }));
  }

  const pendingChanges: PendingChange[] = useMemo(() => {
    if (!saveTarget) return [];
    const capability = capabilities.find((c) => c.id === saveTarget);
    const section = sections.find((s) => s.id === saveTarget);
    const draft = drafts[saveTarget] ?? emptyDraft;
    if (!capability && !section) return [];

    const featureChanges = Object.entries(draft.features).map(([key, value]) => {
      const feature = capability!.features.find((f) => f.key === key)!;
      return {
        key,
        label: feature.label,
        from: feature.state === 'live' ? 'On' : feature.state === 'pending' ? 'Pending' : 'Off',
        to: value ? 'On' : 'Off',
      };
    });

    const fields = capability ? capability.configs : section!.configs;
    const configChanges = Object.entries(draft.configs).map(([key, value]) => {
      const field = fields.find((f) => f.key === key)!;
      return { key, label: field.label, from: formatValue(field.value), to: formatValue(value) };
    });

    return [...featureChanges, ...configChanges];
  }, [saveTarget, capabilities, sections, drafts]);

  function confirmSave() {
    if (!saveTarget) return;
    const capabilityId = saveTarget;
    const draft = drafts[capabilityId] ?? emptyDraft;
    const now = new Date().toISOString();
    const isSection = sections.some((s) => s.id === capabilityId);

    if (isSection) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === capabilityId
            ? {
                ...section,
                configs: section.configs.map((field) =>
                  field.key in draft.configs
                    ? {
                        ...field,
                        value: draft.configs[field.key]!,
                        state: 'pending' as const,
                        declinedBy: undefined,
                        declinedReason: undefined,
                      }
                    : field,
                ),
              }
            : section,
        ),
      );
    }

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

    const capability = capabilities.find((c) => c.id === capabilityId);
    const newEvents: ChangeEvent[] = pendingChanges.map((change, index) => {
      const feature = capability?.features.find((f) => f.key === change.key);
      const field = configsOf(capabilityId).find((f) => f.key === change.key);
      const source: Source = feature ? 'LaunchDarkly' : (field?.source ?? 'AppConfig');
      return {
        id: `local-${Date.now()}-${index}`,
        kind: 'change',
        capabilityId,
        settingKey: change.key,
        settingLabel: change.label,
        from: change.from,
        to: change.to,
        actor: currentUser.name,
        status: 'pending',
        source,
        timestamp: now,
      };
    });

    setHistory((prev) => [...newEvents, ...prev]);
    setDrafts((prev) => ({ ...prev, [capabilityId]: emptyDraft }));
    setSaveTarget(null);
  }

  /** Notes go straight into the history: there is nothing to approve. */
  function addNote(ownerId: string, body: string) {
    setHistory((prev) => [
      {
        id: `note-${Date.now()}`,
        kind: 'note',
        capabilityId: ownerId,
        actor: currentUser.name,
        body,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  const visibleCapabilities = capabilities.filter((c) => c.navGroup === selectedGroup);

  /** Each card owns the slice of history for its own capability or section. */
  const eventsFor = (ownerId: string) => history.filter((event) => event.capabilityId === ownerId);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1920, minWidth: 1280, mx: 'auto', px: 4, py: 3 }}>
        <Box>
          <Typography variant="h1">Retailer configuration</Typography>
          <Typography variant="body1" sx={{ color: palette.textSecondary, mt: 1 }}>
            Manage which features are enabled for each program, retailer, and brand, and track every change.
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Tabs scope={scope} onChange={setScope} />
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
                <LeftNav
                  capabilities={capabilities}
                  selectedId={selectedNavId}
                  selectedGroup={selectedGroup}
                  onSelect={handleNavSelect}
                  onSelectGroup={handleGroupSelect}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {selectedGroup === globalSettingsGroup &&
                  sections.map((section) => (
                    <GlobalSettingCard
                      key={section.id}
                      section={section}
                      events={eventsFor(section.id)}
                      expanded={expandedIds.includes(section.id)}
                      onToggleExpanded={() => toggleExpanded(section.id)}
                      draft={getDraft(section.id)}
                      onConfigChange={(key, next) => handleConfigChange(section.id, key, next)}
                      onSave={() => setSaveTarget(section.id)}
                      onDiscard={() => discard(section.id)}
                      onAddNote={(body) => addNote(section.id, body)}
                      registerFieldRef={(key, node) => {
                        fieldRefs.current[key] = node;
                      }}
                      cardRef={(node) => {
                        cardRefs.current[section.id] = node;
                      }}
                    />
                  ))}

                {visibleCapabilities.map((capability) => (
                  <CapabilityCard
                    key={capability.id}
                    capability={capability}
                    events={eventsFor(capability.id)}
                    expanded={expandedIds.includes(capability.id)}
                    onToggleExpanded={() => toggleExpanded(capability.id)}
                    draft={getDraft(capability.id)}
                    onFeatureChange={(key, next) => handleFeatureChange(capability.id, key, next)}
                    onConfigChange={(key, next) => handleConfigChange(capability.id, key, next)}
                    onSave={() => setSaveTarget(capability.id)}
                    onDiscard={() => discard(capability.id)}
                    onAddNote={(body) => addNote(capability.id, body)}
                    registerFieldRef={(key, node) => {
                      fieldRefs.current[key] = node;
                    }}
                    cardRef={(node) => {
                      cardRefs.current[capability.id] = node;
                    }}
                  />
                ))}
              </Box>
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
