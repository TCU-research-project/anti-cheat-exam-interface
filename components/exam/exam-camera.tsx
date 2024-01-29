import { Camera } from "@mediapipe/camera_utils";
import { FaceDetection, Results } from "@mediapipe/face_detection";
import { Button } from "@mui/material";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import {
  b64toBlob,
  detectCheating,
  extractFaceCoordinates,
  getCheatingStatus,
  printLandmarks,
} from "../../helpers/face-detection/face-detection-helper";
import classes from "./exam-camera.module.scss";
import { CheatingType } from "../../pages/exam/[examId]";

interface ExamCameraProps {
  triggerWarningModal: (title: string, description: string) => void;
  handleCheating: (type: CheatingType) => void;
  onOpenHandleCheat: () => void;
  onLockHandleCheat: () => void;
  openHandleCheat: boolean;
}

const ExamCamera: React.FC<ExamCameraProps> = ({triggerWarningModal, handleCheating, onOpenHandleCheat, openHandleCheat}) => {
  const [img_, setImg_] = useState<string>();
  const webcamRef: React.LegacyRef<Webcam> = useRef();
  const faceDetectionRef = useRef<FaceDetection>(null);
  const realtimeDetection = true;

  const frameRefresh = 30;
  let currentFrame = useRef(0);

  const [chetingStatus, setChetingStatus] = useState("");

  useEffect(() => {
    const faceDetection: FaceDetection = new FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
      },
    });

    faceDetection.setOptions({
      minDetectionConfidence: 0.5,
      model: "short",
    });

    function onResult(result: Results) {
      // TODO: Fix multiple toasts
      if (result.detections.length < 1) {
        triggerWarningModal("WARNING", "Face not detected, make sure your face is visible on the screen!");
        if (openHandleCheat) {
          handleCheating(CheatingType.noFace);
        }
        // toast(
        //   "Face not detected, make sure your face is visible on the screen!"
        // );
        return;
      } else if (result.detections.length > 1) {
        triggerWarningModal("DETECT MULTIPLE FACE", "Detected more than one person in frame, can be flagged as cheating!");
        if (openHandleCheat) {
          handleCheating(CheatingType.multipleFace);
        }
        // toast(
        //   "Detected more than one person in frame, can be flagged as cheating!"
        // );
        return;
      }

      const faceCoordinates = extractFaceCoordinates(result);

      // printLandmarks(result);

      const [lookingLeft, lookingRight] = detectCheating(
        faceCoordinates,
        false
      );

      const cheatingStatus = getCheatingStatus(lookingLeft, lookingRight);
      if (cheatingStatus === 'lookingLeft') {
        if (openHandleCheat) {
          handleCheating(CheatingType.lookingLeft)
        }
        setChetingStatus("");
        triggerWarningModal("CHEATING DETECTED", "You're looking left")
      } else if (cheatingStatus === 'lookingRight') {
        if (openHandleCheat) {
          handleCheating(CheatingType.lookingRight);
        }
        setChetingStatus("");
        triggerWarningModal("CHEATING DETECTED", "You're looking right")
      } else {
        setChetingStatus("Everything is okay!");
        // onOpenHandleCheat();
      }
    }

    faceDetection.onResults(onResult);
    faceDetectionRef.current = faceDetection;

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          // Proceed frames only if real time detection is on
          if (!realtimeDetection) {
            return;
          }

          currentFrame.current += 1;

          if (currentFrame.current >= frameRefresh) {
            currentFrame.current = 0;
            await faceDetection.send({ image: webcamRef.current?.video });
          }
        },
        width: 1280,
        height: 720,
      });

      camera.start();
    }

    return () => {
      faceDetection.close();
    };
  }, [webcamRef, realtimeDetection]);

  const onResultClick = async () => {
    // const imgSrc = webcamRef.current.getScreenshot();
    // const blob = await b64toBlob(imgSrc);
    // const img = new Image(600, 400);
    // const src = URL.createObjectURL(blob);
    // img.src = src;
    // setImg_(src);

    await faceDetectionRef?.current?.send({ image: webcamRef.current.video });
  };

  return (
    <div className={classes.cameraContainer}>
      <p className={classes.cheatingStatus}>Cheating status: {chetingStatus}</p>

      {true && (
        <Webcam
          className={classes.camera}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
      )}

      <br />

      {/* <Button onClick={onResultClick}>Get Result</Button> */}

      {img_ && <NextImage src={img_} alt="Profile" />}
    </div>
  );
};

export default ExamCamera;
