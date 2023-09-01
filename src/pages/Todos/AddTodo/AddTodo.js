import React, { useState } from 'react'
import { Button, Col, ColorPicker, DatePicker, Divider, Form, Image, Input, Progress, Row, Select, Typography, message } from 'antd'
import { setDoc, doc } from "firebase/firestore";
import { firestore, storage } from '../../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuthContext } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography

const initialState = { title: "", date: "", description: "", tag: "", color: "" }

export default function Hero() {
    const navigate = useNavigate();
    const { user } = useAuthContext()
    const [state, setState] = useState(initialState)
    const [file, setFile] = useState(null)
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const { Option } = Select;

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleDate = (_, date) => setState(s => ({ ...s, date }))
    const handleColorChange = (_, color) => setState(s => ({ ...s, color }))


    const handleSubmit = async (e) => {
        e.preventDefault()

        let { title, date, description, tag, color } = state

        if (!title) { return message.error("Please enter title") }


        const todo = {
            title, date, description, tag, color,
            status: "active",
            dateCreated: new Date().getTime(),
            id: Math.random().toString(36).slice(2),
            file: "",
            createdBy: {
                fullName: user.fullName,
                email: user.email,
                uid: user.uid,
            }
        }

        setIsProcessing(true)

        if (file) {
            uploadFile(todo)
        } else {
            createDocument(todo)
        }
    }

    const createDocument = async (todo) => {
        try {
            await setDoc(doc(firestore, "todos", todo.id), todo);
            message.success("A new todo added successfully");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
        setIsProcessing(false);
    };


    const uploadFile = (todo) => {

        const fileName = todo.id
        var fileExtension = file.name.split('.').pop();

        const storageRef = ref(storage, `images/${fileName}.${fileExtension}`);

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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    let data = { ...todo, file: downloadURL }
                    createDocument(data)
                });
            }
        );
    }

    return (
        <>
            <div className='backImage vh-100 vw-100'>
                <div className="container pt-5">
                    <div className="row">
                        <div className="col">
                            <div className="card p-3 p-md-4 trans">
                                <Title level={2} className='m-0 text-center'>Add Todo</Title>

                                <Divider />

                                <Form layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Title">
                                                <Input placeholder='Input your title' name='title' onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Date">
                                                <DatePicker className='w-100' onChange={handleDate} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} lg={8}>
                                            <Form.Item label="Tag">
                                                <Select
                                                    placeholder="Select a Tag"
                                                    value={state.tag}
                                                    onChange={(value) => setState((prevState) => ({ ...prevState, tag: value }))}
                                                >
                                                    <Option value="personal">Personal</Option>
                                                    <Option value="work">Work</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} lg={4}>
                                            <Form.Item label="Color">
                                                <ColorPicker
                                                    showText
                                                    onChange={handleColorChange}
                                                    placement="topLeft"
                                                />
                                            </Form.Item>

                                        </Col>
                                        <Col xs={12} lg={8}>
                                            <Form.Item label="Image">
                                                <Input type='file' placeholder='Upload picture' onChange={e => { setFile(e.target.files[0]) }} />
                                            </Form.Item>
                                            {isProcessing && file && <Progress percent={progress} showInfo={false} />}
                                        </Col>
                                        <Col xs={12} lg={4}>
                                            <Form.Item label="Preview">
                                                {file && <Image src={URL.createObjectURL(file)} style={{ width: 50, height: 50 }} />}
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Description">
                                                <Input.TextArea placeholder='Input your description' name='description' onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                                            <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleSubmit}>Add Todo</Button>
                                        </Col>
                                        <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                                            <Button className='w-100 mt-2' onClick={() => { navigate(`/`) }}>Cancel</Button>
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
