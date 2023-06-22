
import React, { useState, useEffect } from 'react';
import { useLazyQuery, useQuery, useMutation } from '@apollo/client';
import ROSLIB from "roslib";

import Loading from './Loading';
import GraspPointSelectModal from './GraspPointSelectModal';
import { RetryGraspGoal, RetryGraspResult, Pose2D } from '../ros/messages';
import { GET_ALL_PROD } from '../graphql/query';

import './App.css';
import { request } from 'http';

export default function App() {
    // ROS connection from state
    const [ros, setRos] = useState<ROSLIB.Ros | undefined>(undefined);
    const [rosConnected, setRosConnected] = useState(false);
    const [rosError, setRosError] = useState("");
    const [rosRetryServer, setRosRetryServer] = useState<ROSLIB.SimpleActionServer | undefined>(undefined);

    // Action server goal and result from state
    const [regraspGoal, setRegraspGoal] = useState<RetryGraspGoal | undefined>(undefined);
    const [regraspResult, setRegraspResult] = useState<RetryGraspResult | undefined>(undefined);

    const [productDict, setProductDict] = useState<any>({});

    
    const { data: prodData, loading: prodLoading, error: prodError } = useQuery(GET_ALL_PROD);

    // Connect to ROS
    useEffect(() => {
        setRos(new ROSLIB.Ros({
            url: `ws://${process.env.REACT_APP_ROSBRIDGE_HOST}:9090`
        }));
    }, []);

    // Initialize ROS callbacks and services
    useEffect(() => {
        if (!ros) return;

        ros.on("connection", () => {
            console.log('Connected to websocket server.');
            setRosConnected(true);
        });

        ros.on('error', (error: any) => {
            console.log('Error connecting to ROS websocket server: ', error);
            setRosError('Error connecting to ROS websocket server');
        });

        console.log("Creating /aurmr/hri/retry_grasp")
        setRosRetryServer(new ROSLIB.SimpleActionServer({
            ros: ros,
            serverName: '/aurmr/hri/retry_grasp',
            actionName: '/aurmr_hri/RetryGraspAction'
        }));
    }, [ros]);

    // Initialize retry action server callbacks
    useEffect(() => {
        if (!rosRetryServer || !rosConnected) return;

        /* @ts-ignore */
        rosRetryServer.on('goal', (goalMessage: RetryGraspGoal) => {
            console.log(goalMessage);
            setRegraspGoal(goalMessage);
        });

        /* @ts-ignore */
        rosRetryServer.on('cancel', (goalMessage: any) => {
            console.log("Cancelled...");
            rosRetryServer.setPreempted();
        });
    }, [rosRetryServer, rosConnected]);

    useEffect(() => {
        if (prodLoading || !prodData) return;

        const prodDict: any = {};
        for (let i = 0; i < prodData.getAllProducts.length; i++) {
            prodDict[prodData.getAllProducts[i].asin] = prodData.getAllProducts[i];
        }
        setProductDict(prodDict);
        console.log(prodDict);
        // 
    }, [prodData, prodLoading]);

    // Render error or loading screen if necessary
    if (rosError) {
        return <p className='error'>{rosError}</p>;
    }
    if (!rosConnected) {
        return <Loading label="Connecting to robot..." />;
    }
    if (prodLoading || productDict.length === 0) {
        return <Loading label="Loading product data..." />;
    }

    

    // Render waiting screen if no requests are in the queue
    if (!regraspGoal) {
        return (
            <div className='connected'>
                <div className="connected-icon"></div>
                <div className="connected-label">Connected to robot. Waiting for help request...</div>
            </div>
        );
    }

    console.log(regraspGoal);

    return (
        <GraspPointSelectModal
            imageData={"data:image/jpg;base64," + regraspGoal.camera_image.data}
            onRetry={() => {
                rosRetryServer?.setSucceeded(regraspResult);
                setRegraspGoal(undefined);
            }}
            onAbort={() => {
                rosRetryServer?.setPreempted();
                setRegraspGoal(undefined);
            }}
            onTargetSelected={(pos: Pose2D) => {
                setRegraspResult({
                    retry: true,
                    x: pos.x,
                    y: pos.y
                })
            }}
            productName={productDict[""+regraspGoal.object_asin+""].name}
            />
    );
    
}