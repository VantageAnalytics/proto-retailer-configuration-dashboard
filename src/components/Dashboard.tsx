import { useCallback, useRef, useState } from 'react';
import { Box, Collapse, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { cardShadow, palette } from '../theme';
import { buildCapabilities, configGroups, globalSettingSections, navGroups } from '../data/capabilities';
import { buildChangeHistory } from '../data/changeHistory';
import { currentUser } from '../data/people';
import { defaultProgramId, defaultRetailerId, programs, retailers, retailersForProgram } from '../data/retailers';
import { useCases } from '../data/useCases';
import { computeCapabilityStatus, formatValue, isEmptyValue, summaryLine } from '../logic/status';
import { CapabilityCard, emptyDraft, type Draft } from './CapabilityCard';
import { CardChangeHistory, ChangeHistorySection, type HistoryOwnerGroup } from './ChangeHistoryPanel';
import { CompactCardStrip, type CompactCardItem } from './CompactCardStrip';
import { ConfigFieldGroup } from './ConfigFieldGroup';
import { type ConfigValue } from './ConfigFieldRow';
import { LeftNav } from './LeftNav';
import { SaveModal, type PendingChange } from './SaveModal';
import { ScopeSelect } from './ScopeSelectors';
import { UseCasePicker } from './UseCasePicker';
import { UseCaseWizard } from './UseCaseWizard';
import { Banner, PendingPill, SectionHeading, UnsavedBar } from './ui';
import type { Capability, ChangeEvent, ConfigField, GlobalSection, Source, UseCase } from '../types';

type Scope = 'program' | 'retailer' | 'brand';

/** list stacks every card in the group; cards shows small cards above one expanded card. */
export type Layout = 'list' | 'cards';

const globalSettingsGroup = 'Retailer global settings';

/** Space above the card layout's card row while it is pinned to the top of the window. */
const CARD_STRIP_GUTTER = 24;

/** Room around the standalone history card so its shadow isn't cut off by its scroll container. */
const HISTORY_SHADOW_ROOM = 20;

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
  collapsible = true,
  showHistory = true,
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
  collapsible?: boolean;
  showHistory?: boolean;
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
        component={collapsible ? 'button' : 'div'}
        type={collapsible ? 'button' : undefined}
        onClick={collapsible ? onToggleExpanded : undefined}
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
          cursor: collapsible ? 'pointer' : 'default',
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
        {collapsible && <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} style={{ fontSize: 16 }} />}
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

          {showHistory && (
            <CardChangeHistory
              events={events}
              collapsed={historyCollapsed}
              onToggleCollapsed={() => setHistoryCollapsed(!historyCollapsed)}
              onAddNote={onAddNote}
            />
          )}
        </Box>

        {unsavedCount > 0 && <UnsavedBar count={unsavedCount} onDiscard={onDiscard} onSave={onSave} />}
      </Collapse>
    </Box>
  );
}

export function Dashboard({ layout, separateHistory }: { layout: Layout; separateHistory: boolean }) {
  const [scope, setScope] = useState<Scope>('retailer');
  const cardLayout = layout === 'cards';

  const [capabilities, setCapabilities] = useState<Capability[]>(() => buildCapabilities(defaultRetailerId));
  const [sections, setSections] = useState<GlobalSection[]>(globalSettingSections);
  const [history, setHistory] = useState<ChangeEvent[]>(() => buildChangeHistory(defaultRetailerId));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedNavId, setSelectedNavId] = useState<string | null>('meta');
  const [selectedGroup, setSelectedGroup] = useState<string>('Channels');
  const [saveTarget, setSaveTarget] = useState<string | null>(null);
  const [programId, setProgramId] = useState(defaultProgramId);
  const [retailerId, setRetailerId] = useState(defaultRetailerId);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);

  const programRetailers = retailersForProgram(programId);
  const retailer = retailers.find((r) => r.id === retailerId)!;

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardColumnRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const getDraft = useCallback((id: string) => drafts[id] ?? emptyDraft, [drafts]);

  const scrollTo = useCallback((id: string) => {
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /** Each retailer has its own settings and history, so switching drops any unsaved edits. */
  function changeRetailer(id: string) {
    setRetailerId(id);
    setCapabilities(buildCapabilities(id));
    setSections(globalSettingSections);
    setHistory(buildChangeHistory(id));
    setDrafts({});
    setSaveTarget(null);
  }

  function changeProgram(id: string) {
    setProgramId(id);
    const first = retailersForProgram(id)[0];
    if (first) changeRetailer(first.id);
  }

  function submitUseCase(useCase: UseCase, submitted: Record<string, Draft>) {
    submitForApproval(submitted, `Requested through the ${useCase.name} use case.`);
    setActiveUseCase(null);
    const primary = useCase.features[0]?.ownerId;
    if (primary && capabilities.some((c) => c.id === primary)) handleNavSelect(primary);
  }

  function handleNavSelect(id: string) {
    setSelectedNavId(id);
    const capability = capabilities.find((c) => c.id === id);
    setSelectedGroup(capability ? capability.navGroup : globalSettingsGroup);
    if (cardLayout) {
      requestAnimationFrame(anchorToCardStrip);
      return;
    }
    if (!expandedIds.includes(id)) setExpandedIds([...expandedIds, id]);
    requestAnimationFrame(() => scrollTo(id));
  }

  function handleGroupSelect(group: string) {
    setSelectedGroup(group);
    setSelectedNavId(null);
    if (cardLayout) requestAnimationFrame(anchorToCardStrip);
  }

  function handleCardSelect(id: string) {
    setSelectedNavId(id);
    requestAnimationFrame(anchorToCardStrip);
  }

  /**
   * In the card layout, switching cards only scrolls when the reader is already below the
   * card row, and then only far enough that the new card starts right under it.
   */
  function anchorToCardStrip() {
    const column = cardColumnRef.current;
    if (!column) return;
    const target = column.getBoundingClientRect().top + window.scrollY - CARD_STRIP_GUTTER;
    if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'smooth' });
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

  /** Before and after values of a card's draft, as shown for approval and written to the history. */
  function describeChanges(ownerId: string, draft: Draft): PendingChange[] {
    const capability = capabilities.find((c) => c.id === ownerId);
    const featureChanges = Object.entries(draft.features).flatMap(([key, value]) => {
      const feature = capability?.features.find((f) => f.key === key);
      if (!feature) return [];
      return {
        key,
        label: feature.label,
        from: feature.state === 'live' ? 'On' : feature.state === 'pending' ? 'Pending' : 'Off',
        to: value ? 'On' : 'Off',
      };
    });
    const configChanges = Object.entries(draft.configs).flatMap(([key, value]) => {
      const field = configsOf(ownerId).find((f) => f.key === key);
      if (!field) return [];
      return { key, label: field.label, from: formatValue(field.value), to: formatValue(value) };
    });
    return [...featureChanges, ...configChanges];
  }

  const pendingChanges = saveTarget ? describeChanges(saveTarget, drafts[saveTarget] ?? emptyDraft) : [];

  /** Marks every submitted feature and setting Pending approval and logs each one, across any number of cards. */
  function submitForApproval(submitted: Record<string, Draft>, reason?: string) {
    const now = new Date().toISOString();
    const pendingField = (field: ConfigField, draft: Draft | undefined): ConfigField =>
      draft && field.key in draft.configs
        ? {
            ...field,
            value: draft.configs[field.key]!,
            state: 'pending',
            declinedBy: undefined,
            declinedReason: undefined,
          }
        : field;

    setSections((prev) =>
      prev.map((section) =>
        submitted[section.id]
          ? { ...section, configs: section.configs.map((field) => pendingField(field, submitted[section.id])) }
          : section,
      ),
    );

    setCapabilities((prev) =>
      prev.map((capability) => {
        const draft = submitted[capability.id];
        if (!draft) return capability;

        const features = capability.features.map((feature) =>
          feature.key in draft.features
            ? { ...feature, state: 'pending' as const, declinedBy: undefined, declinedReason: undefined }
            : feature,
        );
        const configs = capability.configs.map((field) => pendingField(field, draft));

        // Prerequisite checks recompute off the saved values, so entering an ad
        // account ID flips its check as soon as the change is saved.
        const prerequisites = capability.prerequisites.map((check) => {
          if (!check.fixesFieldKey) return check;
          const field = configs.find((f) => f.key === check.fixesFieldKey);
          if (!field) return check;
          return { ...check, passed: !isEmptyValue(field.value) };
        });

        return { ...capability, features, configs, prerequisites };
      }),
    );

    const newEvents: ChangeEvent[] = Object.entries(submitted).flatMap(([ownerId, draft]) => {
      const capability = capabilities.find((c) => c.id === ownerId);
      return describeChanges(ownerId, draft).map((change, index): ChangeEvent => {
        const feature = capability?.features.find((f) => f.key === change.key);
        const field = configsOf(ownerId).find((f) => f.key === change.key);
        const source: Source = feature ? 'LaunchDarkly' : (field?.source ?? 'AppConfig');
        return {
          id: `local-${Date.now()}-${ownerId}-${index}`,
          kind: 'change',
          capabilityId: ownerId,
          settingKey: change.key,
          settingLabel: change.label,
          from: change.from,
          to: change.to,
          actor: currentUser.name,
          status: 'pending',
          reason,
          source,
          timestamp: now,
        };
      });
    });
    setHistory((prev) => [...newEvents, ...prev]);

    // Only the submitted keys leave the drafts; other unsaved edits on the same card stay.
    setDrafts((prev) => {
      const next = { ...prev };
      for (const [ownerId, draft] of Object.entries(submitted)) {
        const existing = prev[ownerId];
        if (!existing) continue;
        const features = { ...existing.features };
        const configs = { ...existing.configs };
        for (const key of Object.keys(draft.features)) delete features[key];
        for (const key of Object.keys(draft.configs)) delete configs[key];
        next[ownerId] = { features, configs };
      }
      return next;
    });
  }

  function confirmSave() {
    if (!saveTarget) return;
    submitForApproval({ [saveTarget]: drafts[saveTarget] ?? emptyDraft });
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

  const historyGroups: HistoryOwnerGroup[] = navGroups
    .map((group) => ({
      group,
      owners:
        group === globalSettingsGroup
          ? sections.map((s) => ({ id: s.id, name: s.name }))
          : capabilities.filter((c) => c.navGroup === group).map((c) => ({ id: c.id, name: c.name })),
    }))
    .filter((g) => g.owners.length > 0);

  const visibleIds =
    selectedGroup === globalSettingsGroup ? sections.map((s) => s.id) : visibleCapabilities.map((c) => c.id);
  const activeCardId = selectedNavId && visibleIds.includes(selectedNavId) ? selectedNavId : (visibleIds[0] ?? null);

  const compactItems: CompactCardItem[] =
    selectedGroup === globalSettingsGroup
      ? sections.map((section) => {
          const pending = section.configs.filter((field) => field.state === 'pending').length;
          return {
            id: section.id,
            name: section.name,
            caption: section.description,
            summary: `${section.configs.length} settings${pending > 0 ? ` · ${pending} pending` : ''}`,
          };
        })
      : visibleCapabilities.map((capability) => {
          const master = capability.features.find((f) => f.key === capability.masterFeatureKey);
          const masterDraft = master ? getDraft(capability.id).features[master.key] : undefined;
          const masterState = masterDraft !== undefined ? (masterDraft ? 'live' : 'off') : (master?.state ?? 'off');
          return {
            id: capability.id,
            name: capability.name,
            caption: capability.subtitle,
            summary: summaryLine(capability),
            status: computeCapabilityStatus(capability).status,
            toggle: {
              state: masterState,
              disabled: !capability.available || !master,
              disabledReason: !capability.available ? 'Not available for this program' : undefined,
              onChange: (next: boolean) => {
                if (!master) return;
                setSelectedNavId(capability.id);
                handleFeatureChange(capability.id, master.key, next);
              },
            },
          };
        });


  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1920, minWidth: 1280, mx: 'auto', px: 4, py: 3 }}>
        <Box>
          <Typography variant="h1">Retailer configuration</Typography>
          <Typography variant="body1" sx={{ color: palette.textSecondary, mt: 1 }}>
            Manage which features are enabled for each program, retailer, and brand, and track every change.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <ScopeSelect label="Retail Media Program" options={programs} value={programId} onChange={changeProgram} />
            <ScopeSelect label="Retailer" options={programRetailers} value={retailerId} onChange={changeRetailer} />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Tabs scope={scope} onChange={setScope} />
        </Box>

        <Box sx={{ mt: 3 }}>
          {scope !== 'retailer' ? (
            <EmptyScope />
          ) : (
            <>
            <Box sx={{ mb: 3 }}>
              <UseCasePicker useCases={useCases} onChoose={setActiveUseCase} />
            </Box>
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
                  selectedId={cardLayout ? activeCardId : selectedNavId}
                  selectedGroup={selectedGroup}
                  onSelect={handleNavSelect}
                  onSelectGroup={handleGroupSelect}
                />
              </Box>

              <Box
                ref={cardColumnRef}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  // Swapping the expanded card would otherwise let the browser's scroll anchoring jump the page.
                  overflowAnchor: 'none',
                }}
              >
                {cardLayout && (
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      bgcolor: 'background.default',
                      // The pull-up keeps the row in place while giving it a gutter above when pinned.
                      mt: `-${CARD_STRIP_GUTTER}px`,
                      pt: `${CARD_STRIP_GUTTER}px`,
                      pb: 1,
                    }}
                  >
                    <CompactCardStrip
                      key={selectedGroup}
                      items={compactItems}
                      selectedId={activeCardId}
                      onSelect={handleCardSelect}
                    />
                  </Box>
                )}

                {selectedGroup === globalSettingsGroup &&
                  sections
                    .filter((section) => !cardLayout || section.id === activeCardId)
                    .map((section) => (
                      <GlobalSettingCard
                        key={section.id}
                        collapsible={!cardLayout}
                        showHistory={!separateHistory}
                        section={section}
                        events={eventsFor(section.id)}
                        expanded={cardLayout || expandedIds.includes(section.id)}
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

                {visibleCapabilities
                  .filter((capability) => !cardLayout || capability.id === activeCardId)
                  .map((capability) => (
                    <CapabilityCard
                      key={capability.id}
                      collapsible={!cardLayout}
                      showHistory={!separateHistory}
                      capability={capability}
                      events={eventsFor(capability.id)}
                      expanded={cardLayout || expandedIds.includes(capability.id)}
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

              {separateHistory && (
                <Box
                  sx={{
                    width: 340 + 2 * HISTORY_SHADOW_ROOM,
                    flexShrink: 0,
                    m: `-${HISTORY_SHADOW_ROOM}px`,
                    p: `${HISTORY_SHADOW_ROOM}px`,
                    position: 'sticky',
                    top: 24 - HISTORY_SHADOW_ROOM,
                    maxHeight: `calc(100vh - ${48 - 2 * HISTORY_SHADOW_ROOM}px)`,
                    overflowY: 'auto',
                  }}
                >
                  <ChangeHistorySection
                    key={retailerId}
                    events={history}
                    groups={historyGroups}
                    onAddNote={addNote}
                  />
                </Box>
              )}
            </Box>
            </>
          )}
        </Box>
      </Box>

      <SaveModal
        open={saveTarget !== null}
        changes={pendingChanges}
        onCancel={() => setSaveTarget(null)}
        onConfirm={confirmSave}
      />

      {activeUseCase && (
        <UseCaseWizard
          key={`${activeUseCase.id}-${retailerId}`}
          useCase={activeUseCase}
          retailer={retailer}
          capabilities={capabilities}
          sections={sections}
          onCancel={() => setActiveUseCase(null)}
          onSubmit={(submitted) => submitUseCase(activeUseCase, submitted)}
        />
      )}
    </Box>
  );
}
