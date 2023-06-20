import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const retryBtnStyle = {
    marginRight: '15px'
}

interface HelpRequestModalProps {
    onAccept: () => void,
    onReject: () => void,
    onClose: () => void,
    message: string,
    open: boolean,
}

export default function HelpRequestModal(props: HelpRequestModalProps) {

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {props.message}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={props.onAccept} style={retryBtnStyle} variant="contained" color="success" startIcon={<CheckIcon />}>
                Accept
            </Button>
            <Button onClick={props.onReject} variant="outlined" color="error" startIcon={<BlockIcon />}>
                Reject
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}