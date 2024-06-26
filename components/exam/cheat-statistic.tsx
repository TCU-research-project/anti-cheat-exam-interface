import {
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { examActions } from "../../store/exam-store";
import classes from "./question-tracker.module.scss";
import { CheatingStatistic } from "../../pages/exam/[examId]";

interface QuestionTrackerProps { 
  cheatingStatistic: CheatingStatistic;
  handleCheatTableModalOpen: () => void;
  handleCheatTableModalClose: () => void;
}

const CheatStatistic: React.FC<QuestionTrackerProps> = ({cheatingStatistic, handleCheatTableModalOpen}) => {
  const dispatch = useAppDispatch();
  const activeExam = useAppSelector((state) => state.exam.activeExam);

  const currentQuestion = useAppSelector(
    (state) => state.exam.activeExam.currentQuestion
  );

  const onClick = (index: number) => {
    dispatch(examActions.goToQuestion(index));
  };

  if (!activeExam.exam) {
    return <p>Error</p>;
  }

  return (
    <div className={classes.statisticTracker}>
      <Typography component="h1" variant="h6" align="center" fontWeight="bold">
        Thống kê gian lận
      </Typography>
      <div className={classes.questionStatisticLabel}>
        <List>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Nhiều khuôn mặt: {cheatingStatistic.multipleFace}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Không có khuôn mặt: {cheatingStatistic.noFace}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Nhìn sang trái: {cheatingStatistic.lookingLeft}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Nhìn sang phải: {cheatingStatistic.lookingRight}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Nhìn lên trên: {cheatingStatistic.lookingUp}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Nhìn xuống dưới: {cheatingStatistic.lookingDown}</ListItemText>
          </ListItem>
          <ListItem sx={{ pt: "0px", pb: "0px" }}>
            <ListItemText>Rời khỏi tab: {cheatingStatistic.leavingTab}</ListItemText>
          </ListItem>
        </List>
      </div>
      <Stack direction="row" justifyContent="center" sx={{ mt: 1}}>
        <Button onClick={handleCheatTableModalOpen} variant="contained">Chi tiết</Button>
      </Stack>

    </div>
  );
};

export default CheatStatistic;
