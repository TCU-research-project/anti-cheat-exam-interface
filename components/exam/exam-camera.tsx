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
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { drawMesh } from "../../utils/drawMesh";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

  // const blazeface = require('@tensorflow-models/blazeface');


  // const runFacedetection = async () => {

  //   const model = await blazeface.load();
  //   console.log("FaceDetection Model is Loaded..");
  //   setInterval(() => {
  //     detect(model);
  //   }, 100);

  // };

  const returnTensors = false;

  //  Load posenet
  const runFacemesh = async () => {
    // OLD MODEL
    // const net = await facemesh.load({
    //   // inputResolution: { width: 640, height: 480 },
    //   // scale: 0.8,
    // });
    // NEW MODEL
    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // OLD MODEL
      // const face = await net.estimateFaces(video);
      // NEW MODEL
      const face = await net.estimateFaces({ input:video });
      // const face = await net.estimateFaces(video, returnTensors);

      // Get canvas context
      const ctx = canvasRef.current?.getContext("2d");
      // drawMesh(face, ctx);
      requestAnimationFrame(()=>{drawMesh(face, ctx)});
    }
  };

  // const detect = async (model) => {
  //   if (
  //     typeof webcamRef.current !== "undefined" &&
  //     webcamRef.current !== null &&
  //     webcamRef.current.video.readyState === 4
  //   ) {
  //     // Get video properties
  //     const video = webcamRef.current.video;

  //     canvasRef.current.width = 640;
  //     canvasRef.current.height = 480;

  //     // Make detections

  //     const prediction = await model.estimateFaces(video, returnTensors);

  //     const ctx = canvasRef.current?.getContext("2d");
  //     draw(prediction, ctx);
  //   }

  // };


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

    async function onResult(result: Results) {
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

      await sleep(10 * 1000)

      const faceCoordinates = extractFaceCoordinates(result);

      // printLandmarks(result);

      const [lookingLeft, lookingRight, lookingUp, lookingDown] = detectCheating(
        faceCoordinates,
        false
      );

      const cheatingStatus = getCheatingStatus(
        lookingLeft, 
        lookingRight, 
        lookingUp, 
        lookingDown
      );
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
      } else if (cheatingStatus === 'lookingUp') {
        if (openHandleCheat) {
          handleCheating(CheatingType.lookingUp);
        }
        setChetingStatus("");
        triggerWarningModal("PHÁT HIỆN GIAN LẬN", "Bạn đang nhìn lên trên");
      } else if (cheatingStatus === 'lookingDown') {
          if (openHandleCheat) {
            handleCheating(CheatingType.lookingDown);
          }
        setChetingStatus("");
        triggerWarningModal("PHÁT HIỆN GIAN LẬN", "Bạn đang nhìn xuống dưới");
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
    runFacemesh();
    // runFacedetection();

    return () => {
      faceDetection.close();
    };
  }, [webcamRef, realtimeDetection]);

  // const onResultClick = async () => {
  //   // const imgSrc = webcamRef.current.getScreenshot();
  //   // const blob = await b64toBlob(imgSrc);
  //   // const img = new Image(600, 400);
  //   // const src = URL.createObjectURL(blob);
  //   // img.src = src;
  //   // setImg_(src);

  //   await faceDetectionRef?.current?.send({ image: webcamRef.current.video });
  // };

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
