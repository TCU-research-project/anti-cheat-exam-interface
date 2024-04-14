import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { AssignedExam } from "../../models/exam-models";
import classes from "./exam-card.module.scss";
import moment, { monthsShort } from "moment";
import { Stack } from "@mui/system";
import { LoadingBarRef } from "react-top-loading-bar";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import QuizIcon from '@mui/icons-material/Quiz';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// TODO: Disable button for past or future exam

interface ExamCardProps {
  exam: AssignedExam;
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, loadingBarRef }) => {
  const startDate = new Date(exam.startDate);
  const endDate = new Date(exam.endDate);

  const startDateFormatted = moment(startDate).format("DD/MM/YYYY, H:mm");
  const endDateFormatted = moment(endDate).format("DD/MM/YYYY, H:mm");
  const duration = moment.duration(exam.duration, "seconds").as("minutes");

  return (
    <div>
      <Card
        sx={{
          boxShadow: "none",
          outline: "solid #eeeeee 2px",
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Typography
              sx={{ fontSize: 14, marginBottom: "12px" }}
              color="text.secondary"
              gutterBottom
            >
              {exam?.name}
            </Typography>

            <Typography
              sx={{ fontSize: 14, marginBottom: "12px" }}
              color="text.secondary"
              gutterBottom
            >
              ID: {exam?._id}
            </Typography>
          </Stack>

          <Divider />

          <List>
            <ListItem>
              <ListItemIcon>
                <CalendarTodayIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              >
                <span className={classes.examDateSpan}>
                  Thời hạn nộp bài:
                </span>
                <span className={classes.examDateSpan}>
                  {startDateFormatted}
                </span>
                <span className={classes.examDateSpan}>
                  {/* <ArrowForwardIcon /> */}→
                </span>
                <span className={classes.examDateSpan}>{endDateFormatted}</span>
              </ListItemText>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccessAlarmIcon />
              </ListItemIcon>
              <ListItemText
                primary={`${duration} phút`}
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <QuizIcon />
              </ListItemIcon>
              <ListItemText
                primary={`${exam.questionCount} câu hỏi`}
                primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }}
              />
            </ListItem>
          </List>
        </CardContent>
        <CardActions style={{display: 'flex', justifyContent: 'center'}}>
          <div>
            <Link href={`/exam/${exam._id}`}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                sx={{
                  ml: 2,
                  mb: 1,
                }}
                onClick={() => {
                  loadingBarRef.current.continuousStart(50);
                }}
              >
                Bắt đầu làm bài
              </Button>
            </Link>
          </div>

        </CardActions>
      </Card>
    </div>
  );
};

export default ExamCard;
