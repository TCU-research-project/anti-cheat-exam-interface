import { Results } from "@mediapipe/face_detection";

export interface FaceCoordinates {
  leftEye: number;
  leftEar: number;
  mouth: number;
  chin: number;
  rightEye: number;
  rightEar: number;
}

export const extractFaceCoordinates = (result: Results): FaceCoordinates => {
  if (result.detections.length < 1) {
    return;
  }

  // result.detections[0].landmarks[i]
  // i ---> landmark
  // 0 ---> Left Eye
  // 1 ---> Right Eye
  // 2 ---> Mouth
  // 3 ---> Chin
  // 4 ---> Left Ear
  // 5 ---> Right Ear

  const [leftEye, rightEye, mouth, chin, leftEar, rightEar] =
    result.detections[0].landmarks;

  return {
    leftEye: leftEye.x,
    leftEar: leftEar.x,
    mouth: mouth.y,
    chin: chin.y,
    rightEye: rightEye.x,
    rightEar: rightEar.x,
  };
};

export const printLandmarks = (result: Results) => {
  if (result.detections.length < 1) {
    return;
  }

  const { leftEar, leftEye, rightEar, rightEye, mouth, chin } =
    extractFaceCoordinates(result);

  console.log("----------------------");
  console.log(`LEFT EAR: ${leftEar}`);
  console.log(`LEFT EYE: ${leftEye}`);
  console.log("----------------------");
  console.log(`RIGHT EYE: ${rightEye}`);
  console.log(`RIGHT EAR: ${rightEar}`);
  console.log("----------------------");
  console.log(`MOUTH: ${mouth}`);
  console.log(`CHIN: ${chin}`);
  console.log(`SUB: ${mouth - chin}`)
};

export const detectCheating = (
  faceCoordinates: FaceCoordinates,
  printRefults: boolean = false
) => {
  const { leftEar, leftEye, rightEar, rightEye, mouth, chin } = faceCoordinates;

  const leftCoordDistance = leftEye - leftEar;
  const rightCoordDistance = rightEar - rightEye;
  const verticalDistance = mouth - chin;

  // Old Approcah: ears and eyes crossing
  // const lookingLeft = leftEye.x <= leftEar.x;
  // const lookingRight = RightEye.x >= rightEar.x;

  // The higher the distance, the difficult it is to cheat
  const lookingRight = leftCoordDistance <= 0.03;
  const lookingLeft = rightCoordDistance <= 0.03;
  const lookingUp = verticalDistance <= -0.12;
  const lookingDown = verticalDistance >= -0.07;

  if (printRefults) {
    console.log("----------------------");
    console.log(`LOOKING LEFT: ${lookingLeft}`);
    console.log(`LOOKING RIGHT: ${lookingRight}`);
    console.log("----------------------");
    console.log(`LOOKING UP: ${lookingUp}`);
    console.log(`LOOKING DOWN: ${lookingDown}`);
  }

  return [lookingLeft, lookingRight, lookingUp, lookingDown];
};

export const getCheatingStatus = (
  lookingLeft: boolean,
  lookingRight: boolean,
  lookingUp: boolean,
  lookingDown: boolean
): string => {
  if (lookingLeft) return "lookingLeft";
  else if (lookingRight) return "lookingRight";
  else if (lookingUp) return "lookingUp";
  else if (lookingDown) return "lookingDown";
  else return "okay";
};

export const b64toBlob = async (base64: string) =>
  fetch(base64).then((res) => res.blob());
