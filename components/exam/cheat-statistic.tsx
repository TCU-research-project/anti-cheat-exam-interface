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
      <Typography component="h1" variant="h6" sx={{ mb: 2 }} align="center" fontWeight="bold">
        Cheating Counter
      </Typography>
      <div className={classes.questionStatisticLabel}>
        <List>
          <ListItem>
            <ListItemText>Multiple face: {cheatingStatistic.multipleFace}</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>No-face detected: {cheatingStatistic.noFace}</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Looking left: {cheatingStatistic.lookingLeft}</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Looking right: {cheatingStatistic.lookingRight}</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Leaving tab: {cheatingStatistic.leavingTab}</ListItemText>
          </ListItem>
        </List>
      </div>
      <Stack direction="row" justifyContent="center" sx={{ mt: 1}}>
        <Button onClick={handleCheatTableModalOpen} variant="contained">Show detail</Button>
      </Stack>

    </div>
  );
};

export default CheatStatistic;
