import React, { useMemo } from "react";
import classes from "./exam-modals.module.scss";
import { Box, Modal, Typography, Stack } from "@mui/material";
import { ExamButton } from "./exam-buttons";
import { useAppSelector } from "../../hooks";

interface ExamResultModalProps {
  open: boolean;
  onClickButton?: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  open,
  onClickButton
}) => {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "1px solid #000",
    borderRadius: "8px",
    p: 4,
  };
  const activeExam = useAppSelector((state) => state.exam.activeExam);
  const questionCount = activeExam.exam.questionCount;
  // TODO: Add OK Button
  const getAnswerData = () => {
    let countTrueAnswer = 0;
    let countNotAnswered = 0;
    activeExam.answerKeys.forEach((item, index) => {
      if (item === activeExam.exam.answerKeys[index]) {
        countTrueAnswer += 1;
      }
      if (item === null) {
        countNotAnswered += 1
      }
    });
    return [countTrueAnswer, countNotAnswered, activeExam.exam.questionCount - countNotAnswered]
  };

  const [trueAnswer, notAnswered, answered] = getAnswerData();

  return (
    <React.Fragment>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {'Kết quả bài thi'}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Số câu hỏi đã trả lời ${answered}/${questionCount} câu hỏi`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Số câu hỏi chưa trả lời ${notAnswered}/${questionCount} câu hỏi`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Bạn đã trả lời đúng ${trueAnswer}/${questionCount} câu hỏi, đạt ${(( (trueAnswer * 100 ) / (questionCount * 100)) * 100).toFixed(0)}%`}
          </Typography>
        <Stack direction="row" justifyContent="center" sx={{ mt: 1}}>
          <ExamButton label="Kết thúc" onTap={onClickButton} color="grey" />
        </Stack>
        </Box>
      </Modal>
    </React.Fragment>
  );
};
interface WarningModalProps {
  title: string;
  description: string;
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  onClickButton?: () => void;
}

export const EndExamModal: React.FC<WarningModalProps> = ({
  title = "",
  description = "",
  open,
  onClose,
  onClickButton
}) => {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "1px solid #000",
    borderRadius: "8px",
    p: 4,
  };
  // TODO: Add OK Button
  const activeExam = useAppSelector((state) => state.exam.activeExam);

  return (
    <React.Fragment>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {description}
          </Typography>
        <Stack direction="row" justifyContent="center" sx={{ mt: 1}}>
          <ExamButton label="Nộp" onTap={onClickButton} color="grey" />
        </Stack>
        </Box>
      </Modal>
    </React.Fragment>
  );
};

const WarningModal: React.FC<WarningModalProps> = ({
  title = "",
  description = "",
  open,
  onClose,
}) => {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "1px solid #000",
    borderRadius: "8px",
    p: 4,
  };

  // TODO: Add OK Button

  return (
    <React.Fragment>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {description}
          </Typography>
        </Box>
      </Modal>
    </React.Fragment>
  );
};

export default WarningModal;
