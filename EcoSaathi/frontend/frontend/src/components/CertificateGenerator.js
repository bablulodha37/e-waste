// src/components/CertificateGenerator.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import '../css/Certificate.css';

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
                const userData = await api(`/api/auth/user/${id}`);
                setUser(userData);

                // ✅ Fetch real stats from backend
                const statsData = await api(`/api/auth/user/${id}/stats`);
                setStats(statsData);

            } catch (err) {
                setError('Failed to load user or stats data.');
                console.error('Error fetching data for certificate:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
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
                <>
                    <div className="eligibility-status success">
                        🎉 <strong>Congratulations!</strong> You have completed <strong>{completedCount}</strong> requests and are eligible for a certificate!
                    </div>

                    <button 
                        className="pdf-download-btn" 
                        onClick={generatePdf}
                    >
                        ⬇️ Download Certificate (PDF)
                    </button>

                    <div className="certificate-container" ref={certificateRef}>
                        <div className="certificate-border">
                            <div className="certificate-content">
                                <div className="cert-header-logo">🏅 EcoSaathi 🌍</div> 
                                <h1 className="cert-title">Certificate of Recognition</h1>
                                <p className="cert-subtext">Proudly presented to</p>
                                <h2 className="cert-name">{user.firstName} {user.lastName || user.email}</h2>
                                <p className="cert-subtext-large">
                                    For outstanding commitment to <strong>environmental sustainability</strong> and 
                                    responsible e-waste disposal by successfully completing 
                                </p>
                                <p className="cert-count-highlight">
                                    {completedCount} E-Waste Collection Requests
                                </p>
                                <p className="cert-subtext-large">through the EcoSaathi.</p>
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
                <div className="eligibility-status warning">
                    ❌ <strong>Ineligible for Certificate.</strong> You have completed <strong>{completedCount}</strong> requests. 
                    You must complete at least <strong>{MIN_COMPLETED_REQUESTS}</strong> requests to be eligible.
                </div>
            )}
        </div>
    );
}
