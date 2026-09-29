import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { palette } from '../theme';

export interface PendingChange {
  key: string;
  label: string;
  from: string;
  to: string;
}

export function SaveModal({
  open,
  changes,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  changes: PendingChange[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '8px' } } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Send these changes for approval</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 3 }}>
          These changes will be sent for approval. They won't take effect until an approver accepts them.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {changes.map((change) => (
            <Box key={change.key} sx={{ borderBottom: `1px solid ${palette.border}`, pb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {change.label}
              </Typography>
              <Typography variant="body2" sx={{ mt: '2px' }}>
                <Box component="span" sx={{ color: palette.textSecondary }}>
                  {change.from}
                </Box>{' '}
                → <Box component="span" sx={{ fontWeight: 600 }}>{change.to}</Box>
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button onClick={onCancel} sx={{ color: palette.textSecondary }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          Send for approval
        </Button>
      </DialogActions>
    </Dialog>
  );
}
