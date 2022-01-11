#!/usr/bin/env python3
import argparse
import json
import math 

dp_mappings = {
    1: "head",
    2: "neck",
    3: "hips",
    4: "spine",
    5: "chest",
    6: "upperChest",
    7: "leftUpperArm",
    8: "leftLowerArm",
    9: "leftHand",
    10: "rightUpperArm",
    11: "rightLowerArm",
    12: "rightHand",
    13: "leftUpperLeg",
    14: "leftLowerLeg",
    15: "leftFoot",
    16: "rightUpperLeg",
    17: "rightLowerLeg",
    18: "rightFoot",
    
    27: "leftEye",
    28: "rightEye",

    56: "leftShoulder",

    57: "leftIndexProximal",
    58: "leftIndexIntermediate",
    59: "leftIndexDistal",
    60: "leftLittleProximal",
    61: "leftLittleIntermediate",
    62: "leftLittleDistal",
    63: "leftMiddleProximal",
    64: "leftMiddleIntermediate",
    65: "leftMiddleDistal",
    66: "leftRingProximal",
    67: "leftRingIntermediate",
    68: "leftRingDistal",
    69: "leftThumbProximal",
    70: "leftThumbIntermediate",
    71: "leftThumbDistal",

    72: "rightShoulder",

    73: "rightIndexProximal",
    74: "rightIndexIntermediate",
    75: "rightIndexDistal",
    76: "rightLittleProximal",
    77: "rightLittleIntermediate",
    78: "rightLittleDistal",
    79: "rightMiddleProximal",
    80: "rightMiddleIntermediate",
    81: "rightMiddleDistal",
    82: "rightRingProximal",
    83: "rightRingIntermediate",
    84: "rightRingDistal",
    85: "rightThumbProximal",
    86: "rightThumbIntermediate",
    87: "rightThumbDistal",

    101: "leftToes",
    115: "rightToes",
}

def degreesToRadians(x):
    return x*math.pi/180

def eulerToQuaternion(roll, pitch, yaw):
    cy = math.cos(yaw * 0.5)
    sy = math.sin(yaw * 0.5)
    cp = math.cos(pitch * 0.5)
    sp = math.sin(pitch * 0.5)
    cr = math.cos(roll * 0.5)
    sr = math.sin(roll * 0.5)

    qx = sr * cp * cy - cr * sp * sy
    qy = cr * sp * cy + sr * cp * sy
    qz = cr * cp * sy - sr * sp * cy
    qw = cr * cp * cy + sr * sp * sy

    return [qx, qy, qz, qw]

def invertQuaternion(q):
    return [q[0], -q[1], q[2], -q[3]]

def main(args):
    data = {
        "type": "euler",
        "rotations": {}
    }
    with open(args.input, "r") as inputFile:
        for index, line in enumerate(inputFile, 1):
            if index in dp_mappings.keys():
                euler = list(map(lambda x: float(x), line.split(",")))
                ex = (360-euler[0])*math.pi/180
                ey = (360-euler[1])*math.pi/180
                ez = -(360-euler[2])*math.pi/180
                quaternion = eulerToQuaternion(ex, ey, ez)

                data["rotations"][dp_mappings.get(index)] = quaternion
    with open(args.output, "w") as outputFile:
        outputFile.write(json.dumps(data, indent=4))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", dest="input", type=str, help="File you want to convert")
    parser.add_argument("-o", "--output", dest="output", type=str, help="File to put converted data into")
    args = parser.parse_args()
    main(args)