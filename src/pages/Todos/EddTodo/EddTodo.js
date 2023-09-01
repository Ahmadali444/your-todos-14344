import React, { useCallback, useEffect, useState } from 'react'
import { Button, Col, ColorPicker, DatePicker, Divider, Form, Input, Row, Select, Typography, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from '../../../config/firebase'

const { Title } = Typography

const initialState = { title: "", date: "", status: "", description: "", color: "", tag: "" }

export default function EddTodo() {

    const [state, setState] = useState(initialState)
    const [isProcessing, setIsProcessing] = useState(false)
    const navigate = useNavigate()
    const params = useParams()
    const { Option } = Select;

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleDate = (_, date) => setState(s => ({ ...s, date }))
    const handleColorChange = (_, color) => setState(s => ({ ...s, color }))

    const getDocument = useCallback(async () => {
        const docRef = doc(firestore, "todos", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const todo = docSnap.data()
            setState(todo)
        } else {
            message.error("Todo not found");
        }
    }, [params.id]);


    useEffect(() => {
        getDocument();
    }, [getDocument]);


    const handleSubmit = async (e) => {
        e.preventDefault()
        let { title, date, description, status, color, tag } = state

        if (!title) { return message.error("Please enter title") }

        const todo = {
            ...state,
            title, date, description, status, color, tag,
            dateModified: new Date().getTime(),
        }

        setIsProcessing(true)
        try {
            await setDoc(doc(firestore, "todos", todo.id), todo);
            message.success("Todo updated successfully")
            navigate("/")
        } catch (e) {
            console.error("Error adding document: ", e);
        }
        setIsProcessing(false)
    }
    return (
        <>
            <div className='backImage vh-100 vw-100'>
                <div className="container pt-5">
                    <div className="row">
                        <div className="col">
                            <div className="card p-3 p-md-4 trans">
                                <Title level={2} className='m-0 text-center'>Update Todo</Title>

                                <Divider />

                                <Form layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Title">
                                                <Input placeholder='Input your title' name='title' value={state.title} onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Date">
                                                <DatePicker className='w-100' value={state.date ? dayjs(state.date) : ""} onChange={handleDate} />
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
                                        <Col xs={24} lg={12}>
                                            <Form.Item label="Status">
                                                <Select value={state.status} onChange={status => setState(s => ({ ...s, status }))}>
                                                    {["active", "inactive"].map((status, i) => {
                                                        return <Select.Option key={i} value={status}>{status}</Select.Option>
                                                    })}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Description">
                                                <Input.TextArea placeholder='Input your description' name='description' value={state.description} onChange={handleChange} />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                                            <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleSubmit}>Update Todo</Button>
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
