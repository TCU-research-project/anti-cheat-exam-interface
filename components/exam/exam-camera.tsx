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
import { draw } from "../../utils";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface ExamCameraProps {
  triggerWarningModal: (title: string, description: string) => void;
  handleCheating: (type: CheatingType) => void;
  onOpenHandleCheat: () => void;
  onLockHandleCheat: () => void;
  openHandleCheat: boolean;
}

const ExamCamera: React.FC<ExamCameraProps> = ({ triggerWarningModal, handleCheating, onOpenHandleCheat, openHandleCheat }) => {
  const [img_, setImg_] = useState<string>();
  const webcamRef: React.LegacyRef<Webcam> = useRef();
  const faceDetectionRef = useRef<FaceDetection>(null);
  const realtimeDetection = true;
  const canvasRef = useRef(null);

  const frameRefresh = 30;
  let currentFrame = useRef(0);

  const [chetingStatus, setChetingStatus] = useState("");

  const blazeface = require('@tensorflow-models/blazeface');


  const runFacedetection = async () => {

    const model = await blazeface.load();
    console.log("FaceDetection Model is Loaded..");
    setInterval(() => {
      detect(model);
    }, 100);

  };

  const returnTensors = false;

  const detect = async (model) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;

      canvasRef.current.width = 640;
      canvasRef.current.height = 480;

      // Make detections

      const prediction = await model.estimateFaces(video, returnTensors);

      const ctx = canvasRef.current?.getContext("2d");
      draw(prediction, ctx);
    }

  };


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
        triggerWarningModal("CẢNH BÁO", "Không phát hiện khuôn mặt!");
        if (openHandleCheat) {
          handleCheating(CheatingType.noFace);
        }
        // toast(
        //   "Face not detected, make sure your face is visible on the screen!"
        // );
        return;
      } else if (result.detections.length > 1) {
        triggerWarningModal("CẢNH BÁO", "Phát hiện nhiều khuôn mặt");
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
          handleCheating(CheatingType.lookingLeft);
        }
        setChetingStatus("");
        triggerWarningModal("PHÁT HIỆN GIAN LẬN", "Bạn đang nhìn sang trái");
      } else if (cheatingStatus === 'lookingRight') {
        if (openHandleCheat) {
          handleCheating(CheatingType.lookingRight);
        }
        setChetingStatus("");
        triggerWarningModal("PHÁT HIỆN GIAN LẬN", "Bạn đang nhìn sang phải");
      } else {
        setChetingStatus("Không phát hiện bất thường");
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

    runFacedetection();

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
      <p className={classes.cheatingStatus}>Trạng thái hiện tại: {chetingStatus}</p>

      {/* {true && (
        
      )} */}
      <Webcam
        className={classes.camera}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          position: 'relative',
          top: 0,
          left: 0,
          zIndex: 9,
          // display:'none'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          // position: "absolute",
          top: 2,
          left: -3,
          right: 50,
          position: 'absolute',
          zIndex: 9,
          width: '100%',
          height: '100%',
        }}
      />

      <br />

      {/* <Button onClick={onResultClick}>Get Result</Button> */}

      {img_ && <NextImage src={img_} alt="Profile" />}
    </div>
  );
};

export default ExamCamera;
