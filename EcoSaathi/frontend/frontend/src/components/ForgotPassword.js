import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css'; // Reuse login styles

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_AUTH = "http://localhost:8080/api/auth";

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setMessage(""); setError("");
        try {
            await axios.post(`${API_AUTH}/forgot-password?email=${email}`);
            setStep(2);
            setMessage("OTP sent to your email!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Check email.");
        }
    };

    // Step 2: Reset Password
    const handleReset = async (e) => {
        e.preventDefault();
        setMessage(""); setError("");
        try {
            await axios.post(`${API_AUTH}/reset-password`, {
                email,
                otp,
                newPassword
            });
            alert("Password Reset Successfully! Please Login.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP or Error.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-right" style={{width: '100%', maxWidth:'400px', margin:'50px auto'}}>
                <div className="login-card">
                    <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
                    
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <label>Enter your Registered Email</label>
                            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                            <button type="submit" className="login-btn">Send OTP</button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset}>
                            <p style={{color:'green', fontSize:'14px'}}>{message}</p>
                            
                            <label>Enter OTP</label>
                            <input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} required />
                            
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
                            
                            <button type="submit" className="login-btn">Change Password</button>
                        </form>
                    )}
                    
                    {error && <p className="error">{error}</p>}
                    <button onClick={()=>navigate('/login')} className="otp-cancel-btn" style={{marginTop:'10px'}}>Back to Login</button>
                </div>
            </div>
        </div>
    );
}