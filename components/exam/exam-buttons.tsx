import { Button, Grid, Stack } from "@mui/material";
import React from "react";
import { useAppDispatch } from "../../hooks";
import { examActions } from "../../store/exam-store";
import classes from "./exam-buttons.module.scss";

interface ExamButtonsGroupProps {}

interface ExamButtonProps {
  label: string;
  onTap: () => void;
  color: string;
}

export const ExamButton: React.FC<ExamButtonProps> = ({ label, onTap, color }) => {
  return (
    <Grid item>
      <Button
        sx={{
          backgroundColor: color,
          color: "white",
        }}
        onClick={onTap}
        variant="contained"
      >
        {label}
      </Button>
    </Grid>
  );
};

const ExamButtonsGroup: React.FC<ExamButtonsGroupProps> = () => {
  const dispatch = useAppDispatch();

  const onPreviousClicked = () => {
    dispatch(examActions.prevQuestion());
  };

  const onNextClicked = () => {
    dispatch(examActions.nextQuestion());
  };

  return (
    <div className={classes.examButtonGroup}>
      <Stack direction="row" spacing={2} justifyContent="center">
        <ExamButton label="Câu trước" onTap={onPreviousClicked} color="grey" />
        <ExamButton label="Câu sau" onTap={onNextClicked} color="#388e3c" />
      </Stack>
    </div>
  );
};

export default ExamButtonsGroup;
