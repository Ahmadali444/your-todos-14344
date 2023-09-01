import React, { useState } from 'react'
import { Button, Divider, Form, Input, Typography, message } from 'antd'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { Link } from 'react-router-dom'

const { Title } = Typography

export default function ForgotPassword() {
  const auth = getAuth();
  const [state, setState] = useState({ email: "", password: "" })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

  // Function to send password reset email
  const sendResetEmail = e => {
    e.preventDefault()

    let { email } = state
    setIsProcessing(true)
    sendPasswordResetEmail(auth, email)
      .then(() => {
        message.success('Password reset email sent. Check your inbox!');
      })
      .catch((error) => {
        // Handle errors
        console.error("Error sending password reset email:", error);
        message.error('Error sending password reset email: ' + error.message);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };


  return (
    <main className='auth backImage'>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card p-3 p-md-4 trans">
              <Title level={2} className='m-0 text-center'>Forgot Password</Title>

              <Divider />

              <Form layout="vertical">
                <Form.Item label="Email">
                  <Input placeholder='Input your email' name='email' onChange={handleChange} />
                </Form.Item>

                <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={sendResetEmail}>Send Email</Button>
                <p className='mb-0 mt-3 text-center'>Already User: <Link to="/auth/login" className='text-danger fw-bold'>Login</Link> </p>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
