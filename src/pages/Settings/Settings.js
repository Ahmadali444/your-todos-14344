import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, DatePicker, Divider, Form, Input, Progress, Row, Typography, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, firestore, storage } from '../../config/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useAuthContext } from '../../contexts/AuthContext';

const { Title } = Typography;

const initialState = { fullName: "", email: "", dob: null, status: "", file: "" };

export default function Settings() {
    const [state, setState] = useState(initialState);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDelProcessing, setIsDelProcessing] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState(null);

    const handleChange = e => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleDate = dob => {
        setState(prevState => ({ ...prevState, dob }));
    };

    const getDocument = useCallback(async () => {
        const docRef = doc(firestore, "users", params.id);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setState(prevState => ({ ...userData, id: docSnap.id }));
            } else {
                message.error("User not found");
            }

        } catch (error) {
            message.error("Error getting user data");
        }
    }, [params.id]);

    useEffect(() => {
        getDocument();
    }, [getDocument]);


    const handleSubmit = async e => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await setDoc(doc(firestore, "users", params.id), state);
            if (file) {
                uploadFile(state);
            }
            message.success("User data updated successfully");
            navigate("/");
        } catch (error) {
            message.error("Error updating user data");
            setIsProcessing(false);
            return;
        }
    };


    const uploadFile = (user) => {

        const fileName = user.id
        var fileExtension = file.name.split('.').pop();

        const storageRef = ref(storage, `cv/${fileName}.${fileExtension}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(Math.floor(progress))
            },
            (error) => {
                message.error("Something went wrong while uploading file")
                setIsProcessing(false)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                    const updatedUser = { ...user, file: downloadURL };
                    setDoc(doc(firestore, "users", user.id), updatedUser)
                        .then(() => {
                            setIsProcessing(false);
                            message.success("File uploaded and user data updated");
                        })
                        .catch(() => {
                            setIsProcessing(false);
                            message.error("Something went wrong while updating user data");
                        });
                });
            }
        );
    }
    const handleDelete = async () => {
        setIsDelProcessing(true);

        try {
            await deleteDoc(doc(firestore, "users", state.id));
            await deleteAssociatedTodos(state.id);

            message.success("Account deleted successfully");
            setIsDelProcessing(false);
            handleLogout();
        } catch (error) {
            message.error("Error deleting account");
            setIsDelProcessing(false);
        }
    };

    const deleteAssociatedTodos = async (userId) => {
        const todosRef = collection(firestore, "todos");
        const querySnapshot = await getDocs(query(todosRef, where("createdBy.uid", "==", userId)));

        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    };

    const { isAuth, dispatch } = useAuthContext()
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                message.success("Signout successful")
                dispatch({ type: "SET_LOGGED_OUT" })
                navigate(`/auth/login/`)
            })
            .catch(err => {
                message.error("Signout not successful")
            })
    }

    return (
        <>
            <div className='backImage vh-100 vw-100'>
                <div className="container pt-5">
                    <div className="row">
                        <div className="col">
                            <div className="card p-3 p-md-4 trans">
                                <Title level={2} className='m-0 text-center'>Settings</Title>

                                <Divider />

                                <Form layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Full Name">
                                                <Input placeholder='Input your Full Name' name='fullName' value={state.fullName} onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Email">
                                                <Input placeholder='Input your Email' name='email' value={state.email} onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Date">
                                                <DatePicker className='w-100' value={state.dob ? dayjs(state.dob) : ""} onChange={handleDate} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} lg={12}>
                                            <Form.Item label="Your CV">
                                                <Input type='file' placeholder='Upload PDF' onChange={e => { setFile(e.target.files[0]) }} />
                                            </Form.Item>
                                            {isProcessing && file && <Progress percent={progress} showInfo={false} />}
                                        </Col>
                                        <Col xs={12} lg={12} >
                                            <Button className="w-100 bg-danger" loading={isDelProcessing} onClick={handleDelete}>
                                                Delete Account
                                            </Button>
                                        </Col>
                                        <Col xs={12} lg={12} >
                                            <Button type="primary" htmlType="submit" className="w-100" loading={isProcessing} onClick={handleSubmit}>
                                                Save Settings
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
