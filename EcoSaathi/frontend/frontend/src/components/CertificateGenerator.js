// src/components/CertificateGenerator.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import '../css/Certificate.css';

// The required minimum number of completed requests
const MIN_COMPLETED_REQUESTS = 10;

export default function CertificateGenerator() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Data
                const userData = await api(`/api/auth/user/${id}`);
                setUser(userData);

                // Fetch Stats Data (using a mock for now, replace with actual API call later)
                // NOTE: The stats data should come from your API via 'api('/api/user/stats/${id}')' or similar
                const statsData = await new Promise(resolve => {
                    setTimeout(() => {
                        // **MOCK DATA:** Assuming 'completed' is the count you need.
                        // You should replace this with your actual API call.
                        resolve({ total: 15, pending: 3, approved: 0, completed: 12 });
                    }, 500);
                });
                setStats(statsData);
            } catch (err) {
                setError('Failed to load user and stats data.');
                console.error('Error fetching data for certificate:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const generatePdf = () => {
        const element = certificateRef.current;
        if (element) {
            const options = {
                margin: 0,
                filename: `eCoSaathi_Certificate_${user.firstName || 'User'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };
            html2pdf().from(element).set(options).save();
        }
    };

    if (loading) return <div className="container certificate-page">Loading Certificate Status...</div>;
    if (error) return <div className="container error-msg">❌ {error}</div>;

    const completedCount = stats?.completed || 0;
    const isEligible = completedCount >= MIN_COMPLETED_REQUESTS;

    return (
        <div className="container certificate-page">
            
            {isEligible ? (
                // ✅ RENDER ELIGIBLE CONTENT
                <>
                    <div className="eligibility-status success">
                        🎉 **Congratulations!** You have completed **{completedCount}** requests and are eligible for a certificate!
                    </div>

                    <button 
                        className="pdf-download-btn" 
                        onClick={generatePdf}
                    >
                        ⬇️ Download Certificate (PDF)
                    </button>

                    {/* Certificate Content - This is what gets converted to PDF */}
                    <div className="certificate-container" ref={certificateRef}>
                        <div className="certificate-border">
                            <div className="certificate-content">
                                <div className="cert-header-logo">🏅 EcoSaathi 🌍</div> 
                                <h1 className="cert-title">Certificate of Recognition</h1>
                                <p className="cert-subtext">Proudly presented to</p>
                                <h2 className="cert-name">{user.firstName} {user.lastName || user.email}</h2>
                                <p className="cert-subtext-large">
                                    For outstanding commitment to **environmental sustainability** and 
                                    responsible e-waste disposal by successfully completing 
                                </p>
                                <p className="cert-count-highlight">
                                    {completedCount} E-Waste Collection Requests
                                </p>
                                <p className="cert-subtext-large">
                                    through the EcoSaathi.
                                </p>
                                <div className="cert-footer">
                                    <div className="cert-signature">
                                        <p className="signature-name">Bablu Lodha</p> 
                                        <div className="signature-line"></div>
                                        <p>eCoSaathi Administration</p>
                                    </div>
                                    <div className="cert-date">
                                        <p>Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // 🛑 RENDER INELIGIBLE MESSAGE
                <div className="eligibility-status warning">
                    **Ineligible for Certificate.** You have completed **{completedCount}** requests. 
                    You must complete at least **{MIN_COMPLETED_REQUESTS}** requests to be eligible.
                </div>
            )}
        </div>
    );
}