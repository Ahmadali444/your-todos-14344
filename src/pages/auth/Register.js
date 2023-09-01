import React, { useState } from 'react'
import { Button, DatePicker, Divider, Form, Input, Typography, message } from 'antd'
import { useAuthContext } from '../../contexts/AuthContext'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, firestore } from '../../config/firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'

const { Title } = Typography

export default function Register() {

  const { dispatch } = useAuthContext()
  const [state, setState] = useState({ fullName: "", email: "", password: "", dob: "", file: "" })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

  const handleRegister = e => {
    e.preventDefault()

    let { fullName, email, password, dob, file } = state

    console.log(fullName, dob, file, "file", file, "file");
    setIsProcessing(true)
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        createUserProfile(user)
      })
      .catch(err => {
        message.error("Something went wrong while creating user")
        console.error(err)
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }

  const createUserProfile = async (user) => {
    let { fullName, dob, file, password } = state
    const { email, uid } = user

    const userData = {
      fullName, email, uid, dob, file, password,
      dateCreated: serverTimestamp(),
      status: "active",
      roles: ["user"]
    }

    try {
      await setDoc(doc(firestore, "users", uid), userData);
      message.success("A new user has been created successfully")
      dispatch({ type: "SET_LOGGED_IN", payload: { user: userData } })
    } catch (e) {
      message.error("Something went wrong while creating user profile")
      console.error("Error adding document: ", e);
    }
  }

  return (
    <main className='auth backImage'>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card p-3 p-md-4 trans">
              <Title level={2} className='m-0 text-center'>Register</Title>

              <Divider />

              <Form layout="vertical">
                <Form.Item label="Full Name">
                  <Input placeholder='Input your full name' name='fullName' onChange={handleChange} />
                </Form.Item>
                <Form.Item label="Email">
                  <Input placeholder='Input your email' name='email' onChange={handleChange} />
                </Form.Item>
                <Form.Item label="Password">
                  <Input.Password placeholder='Input your password' name='password' onChange={handleChange} />
                </Form.Item>
                <Form.Item label="Birth Date">
                  <DatePicker className='w-100' onChange={(dateObject, dateString) => { setState(s => ({ ...s, dob: dateString })) }} />
                </Form.Item>

                <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleRegister}>Register</Button>
                <p className='mb-0 mt-3 text-center'>Already User: <Link to="/auth/login" className='text-danger fw-bold'>Login</Link> </p>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
