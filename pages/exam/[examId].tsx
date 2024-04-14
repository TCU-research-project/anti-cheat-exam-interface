import { Grid } from "@mui/material";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import AppBarExam from "../../components/exam/app-bar-exam";
import ExamButtonsGroup from "../../components/exam/exam-buttons";
import ExamCamera from "../../components/exam/exam-camera";
import QuestionTracker from "../../components/exam/question-tracker";
import QuestionWidget from "../../components/exam/question-widget";
import CheatStatistic from "../../components/exam/cheat-statistic";
import { getExam } from "../../helpers/api/exam-api";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { Exam } from "../../models/exam-models";
import { examActions } from "../../store/exam-store";
import { toast } from "react-toastify";
import {
  getBrowserDocumentHiddenProp,
  getBrowserVisibilityProp,
  getVisibilityEventNames,
  usePageVisibility,
} from "../../helpers/app/visibility-event";
import WarningModal, { EndExamModal, ExamResultModal } from "../../components/exam/exam-modals";
import { useRouter } from "next/router";
import Head from "next/head";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import CheatingTableModal from "../../components/exam/cheating-table-modal";
import { submitExam } from "../../helpers/api/user-api";

const TESTING = false;

// TODO (CHEAT DETECTION):
//
// If change tab more than 3 times, submit exam
//
// Disable back button
//
// Save answer keys and timer after every answer selection
// Create new API for it
//
// If user starts exam again without submitting exam, then
// Then load answers and keys
// Only within given time period of exam
//
// Cannot give exam again after submitting
// TODO (UI):
//
// This screen should be full screen
// Timer state changes saved every 30 secs
//
// Block interactions while loading
//

interface ExamPageProps {
  exam: Exam;
  error: string;
}

export interface CheatingStatistic {
  lookingLeft: number;
  lookingRight: number;
  multipleFace: number;
  noFace: number;
  leavingTab: number;
}

export enum CheatingType {
  lookingLeft = 'lookingLeft',
  lookingRight = 'lookingRight',
  multipleFace = 'multipleFace',
  noFace = 'noFace',
  leavingTab = 'leavingTab'
}

export enum CheatingTypeText {
  lookingLeft = 'Nhìn sang trái',
  lookingRight = 'Nhìn sang phải',
  multipleFace = 'Phát hiện nhiều khuôn mặt',
  noFace = 'Không phát hiện khuôn mặc',
  leavingTab = 'Rời khỏi tab'
}

export interface CheatingData {
  text: string;
  time: any;
}

const cheatingMockData: Array<CheatingData> = [
  // { text: CheatingTypeText.leavingTab, time: Date.now() },
  // { text: CheatingTypeText.lookingLeft, time: Date.now() },
  // { text: CheatingTypeText.multipleFace, time: Date.now() },
  // { text: CheatingTypeText.noFace, time: Date.now() },
];

const ExamPage: React.FC<ExamPageProps> = ({ exam, error }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  const activeExam = useAppSelector((state) => state.exam.activeExam);

  const [didLeaveExam, setDidLeaveExam] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEndExamVisible, setIsModalEndExamVisible] = useState(false);
  const [isModalExamResultVisible, setIsModalExamResultVisible] = useState(false);

  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [modalData, setModalData] = useState<{
    title: string;
    description: string;
  }>();

  const openHandleCheat = useRef(true);

  const onOpenHandleCheat = () => openHandleCheat.current = true;
  const onLockHandleCheat = () => openHandleCheat.current = false;

  const handleCheating = (type: CheatingType) => {
    if (openHandleCheat.current) {
      setCheatingStatistic((prevState: CheatingStatistic) => ({
        ...prevState,
        [type]: prevState[type] + 1
      }));
      setCheatDatas(
        (prevState: CheatingData[]) => [...prevState, {text: CheatingTypeText[type], time: Date.now()}])
    }
    onLockHandleCheat();
  };

  const [cheatingStatistic, setCheatingStatistic] = useState<CheatingStatistic>({
    lookingLeft: 0,
    lookingRight: 0,
    multipleFace: 0,
    noFace: 0,
    leavingTab: 0
  });

  const [cheatDatas, setCheatDatas] = useState<CheatingData[]>(cheatingMockData)

  const [openCheatTableModal, setOpenCheatTableModal] = React.useState(false);
  const handleCheatTableModalOpen = () => setOpenCheatTableModal(true);
  const handleCheatTableModalClose = () => {
    openHandleCheat.current = true;
    setOpenCheatTableModal(false);
  };

  // Load exam into state
  useEffect(() => {
    if (!exam) return;

    dispatch(examActions.setActiveExam(exam));

    return () => {
      dispatch(examActions.clearActiveExam());
    };
  }, [dispatch, exam]);

  // Prevent refresh
  useEffect(() => {
    const beforeUnloadEventHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault();

      const warningMessage = "Are you sure you want to leave the exam?";

      if (event) {
        event.returnValue = warningMessage; // Legacy method for cross browser support
      }

      return warningMessage;
    };

    window.addEventListener("beforeunload", beforeUnloadEventHandler, {
      capture: true,
    });

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadEventHandler, {
        capture: true,
      });
    };
  }, []);

  // Tab change
  useEffect(() => {
    const hiddenProp = getBrowserDocumentHiddenProp();
    const visibilityChangeEventName = getBrowserVisibilityProp();

    const handleVisibilityChange = () => {
      if (document[hiddenProp]) {
        setDidLeaveExam(true);
      } else {
        showModal(
          "Cảnh báo!",
          "Rời khỏi tab là hành vi gian lận!"
        );
        handleCheating(CheatingType.leavingTab);
        dispatch(examActions.increaseTabChangeCount());
      }
    };

    document.addEventListener(
      visibilityChangeEventName,
      handleVisibilityChange,
      false
    );

    return () => {
      document.removeEventListener(
        visibilityChangeEventName,
        handleVisibilityChange
      );
    };
  }, []);

  const showModal = (title: string, description: string) => {
    setIsModalVisible(true);
    setModalData({
      title,
      description,
    });
  };

  const showModalEndExam  = () => {
    setIsModalEndExamVisible(true);
  };

  const showModalExamResult  = () => {
    setIsModalExamResultVisible(true);
  };

  const hideModalEndExam  = () => {
    setIsModalEndExamVisible(false);
  };

  const onSubmitExam = async () => {
    setIsLoading(true);
    loadingBarRef.current.continuousStart(50);

    try {
      const result = await submitExam(
        session.data?.user.id,
        activeExam.exam._id,
        activeExam.answerKeys,
        session.data?.user.token
      );
      hideModalEndExam();
      showModalExamResult();
    } catch (e) {
      toast(e.message || "Failed to submit exam, please try again!");
    } finally {
      setIsLoading(false);
      loadingBarRef.current.continuousStart(50);
    }
  };

  const onFinish = () => {
    router.replace("/dashboard");
  }

  const hideModel = () => {
    // if (!didLeaveExam) {
    //   return;
    // }
    setIsModalVisible(false);
    setModalData({
      title: "",
      description: "",
    });
    onOpenHandleCheat();

    if (activeExam.tabChangeCount > 3) {
      // toast("You've changed tab more than 3 times, exam is being submitted!");
      // TODO: submit exam
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!activeExam) {
    return <p>Loading...</p>;
  }

  if (activeExam.exam._id !== exam._id) {
    return <p>Error!</p>;
  }

  return (
    <React.Fragment>
      <Head>
        <title>{exam.name}</title>
      </Head>

      <LoadingBar color="#ffffff" ref={loadingBarRef} />

      <AppBarExam
        examName={activeExam.exam.name}
        onEndExam={showModalEndExam}
        isLoading={isLoading}
        onSubmitExam={onSubmitExam}
      />

      <Grid
        container
        direction="row"
        sx={{
          height: "calc(100% - 4rem)",
        }}
      >
        <Grid item xs={3}>
          <Grid
            container
            direction="column"
            height="100%"
            justifyContent=""
          >
            <Grid item>
              <QuestionTracker />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid
            container
            direction="column"
            height="100%"
            justifyContent="space-between"
          >
            <Grid item>
              <QuestionWidget />
            </Grid>
            <Grid item style={{ marginBottom: "40px" }} alignContent="center">
              <ExamButtonsGroup />
              {/* <p>Exam Leave Count: {activeExam.tabChangeCount}</p> */}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={3}>
          <Grid
            container
            direction="column"
            height="100%"
            justifyContent="space-between"
          >
            <Grid item>
              <ExamCamera 
                triggerWarningModal={showModal} 
                handleCheating={handleCheating}
                onLockHandleCheat={onLockHandleCheat}
                onOpenHandleCheat={onOpenHandleCheat}
                openHandleCheat={openHandleCheat.current}
              />
            </Grid>
            <Grid item>
              <CheatStatistic 
                cheatingStatistic={cheatingStatistic} 
                handleCheatTableModalOpen={handleCheatTableModalOpen} 
                handleCheatTableModalClose={handleCheatTableModalClose} 
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Disabled for testing */}
      {!TESTING && (
        <WarningModal
          open={isModalVisible}
          title={modalData?.title}
          description={modalData?.description}
          onClose={hideModel}
        />
      )}
      <ExamResultModal
        open={isModalExamResultVisible}
        onClickButton={onFinish}
      />
      <EndExamModal
        open={isModalEndExamVisible}
        title={'Nộp bài'}
        description={'Bạn có chắc chắn muốn nộp bài thi không'}
        onClose={hideModalEndExam}
        onClickButton={onSubmitExam}
      />
      <CheatingTableModal 
        isOpen={openCheatTableModal} 
        cheatDatas={cheatDatas} 
        handleCheatTableModalClose={handleCheatTableModalClose} 
      />
    </React.Fragment>
  );
};

const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  // TODO: Pass query "redirect_to", and use that for redirection
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const { examId } = context.params;

  try {
    const exam = await getExam(
      session.user.id,
      examId.toString(),
      session.user.token
    );

    if (!exam) {
      throw new Error("Failed to get exam!");
    }

    return {
      props: {
        exam: exam,
        error: null,
      },
    };
  } catch (e) {
    return {
      props: {
        exam: null,
        error: e.message ?? "Failed to get exam!",
      },
    };
  }
};

export default ExamPage;
export { getServerSideProps };
