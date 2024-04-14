import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material";
import ExamTimer from "./exam-timer";
import { LoadingBarRef } from "react-top-loading-bar";

// TODO:
//
// Handle Loading statewide
//

interface AppBarExamProps {
  examName: string;
  onEndExam: () => void;
  isLoading: boolean;
  onSubmitExam: () => void;
}

const AppBarExam: React.FC<AppBarExamProps> = ({ examName, onEndExam, isLoading }) => {
  return (
    <>
      <AppBar position="static" style={{borderRadius: "0 0 25px 25px"}}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {examName}
          </Typography>

          <ExamTimer onTimerEnd={onEndExam} />

          <Button
            variant="contained"
            color="warning"
            sx={{
              opacity: isLoading ? 0.8 : 1,
              ml: 3,
            }}
            onClick={onEndExam}
            disabled={isLoading}
            disableElevation
          >
            Nộp bài
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default AppBarExam;
