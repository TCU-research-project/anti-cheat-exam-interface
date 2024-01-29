import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { CheatingData } from '../../pages/exam/[examId]';
import { Divider, List, ListItem, ListItemText } from '@mui/material';
import dayjs from 'dayjs';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface CheatingTableModalProps {
  isOpen: boolean;
  cheatDatas: CheatingData[];
  handleCheatTableModalClose: () => void;
}

const convertDate = (timestamp: any) => {
  if (!timestamp) return "";
  return dayjs(new Date(timestamp)).format("hh:mm:ss A");
};

const CheatingTableModal: React.FC<CheatingTableModalProps> = ({ isOpen, handleCheatTableModalClose, cheatDatas }) => {
  return (
    <div>
      <Modal
        open={isOpen}
        onClose={handleCheatTableModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
            Statistic
          </Typography>
          <List sx={{border: 'solid black 0.5px'}}>
            {cheatDatas.map((item, index) => {
              return (
                <>
                  <ListItem key={index}>
                    <ListItemText>{item.text}: {convertDate(item.time)}</ListItemText>
                  </ListItem>
                  {index < cheatDatas.length - 1 && <Divider />}
                </>
              );
            })}
          </List>
        </Box>
      </Modal>
    </div>
  );
};

export default CheatingTableModal;