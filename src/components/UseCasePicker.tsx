import { useState } from 'react';
import { Box, Collapse, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import type { UseCase } from '../types';
import { TextAction } from './ui';

function UseCaseCard({ useCase, onChoose }: { useCase: UseCase; onChoose: () => void }) {
  const settings = useCase.globalFields.length + useCase.channelFields.length;
  return (
    <Box
      component="button"
      type="button"
      onClick={onChoose}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        px: 2,
        py: 1.5,
        textAlign: 'left',
        font: 'inherit',
        color: 'text.primary',
        bgcolor: 'background.paper',
        border: `1px solid ${palette.border}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'border-color 120ms, box-shadow 120ms, background-color 120ms',
        '& .use-case-action': { opacity: 0, transform: 'translateX(-4px)', transition: 'opacity 120ms, transform 120ms' },
        '&:hover, &:focus-visible': {
          borderColor: brand.periwinkle,
          boxShadow: '0 2px 8px rgba(52, 87, 181, 0.12)',
          '& .use-case-action': { opacity: 1, transform: 'none' },
        },
        '&:focus-visible': { outline: `2px solid ${brand.periwinkleDark}`, outlineOffset: 2 },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4">{useCase.name}</Typography>
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
          {useCase.description}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="caption" sx={{ color: palette.textSecondary }}>
          {useCase.features.length} features · {settings} settings
        </Typography>
        <Box
          className="use-case-action"
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12, fontWeight: 600, color: brand.periwinkleDark }}
        >
          Review
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
        </Box>
      </Box>
    </Box>
  );
}

/** Preset setups for the retailer, collapsed until asked for; choosing one opens the use case wizard. */
export function UseCasePicker({ useCases, onChoose }: { useCases: UseCase[]; onChoose: (useCase: UseCase) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        // Half-strength periwinkle tint: just enough to lift the box off the white page.
        bgcolor: '#F7F9FF',
        border: `1px solid ${palette.border}`,
        borderRadius: '8px',
        px: 2.5,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3">Get started faster by choosing a preset</Typography>
          <Typography variant="body2" sx={{ color: palette.textSecondary, mt: '2px' }}>
            Start from a preset bundle of features and settings. You'll review every change before it's sent for approval.
          </Typography>
        </Box>
        <TextAction icon={open ? faAngleUp : faAngleDown} onClick={() => setOpen(!open)}>
          {open ? 'Hide options' : 'Show options'}
        </TextAction>
      </Box>
      <Collapse in={open}>
        <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} onChoose={() => onChoose(useCase)} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
