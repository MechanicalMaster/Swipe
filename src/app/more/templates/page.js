'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { templates } from '@/components/InvoiceTemplates';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import styles from '../page.module.css'; // Reuse existing styles or create new

// Dummy data for preview
const dummyData = {
    invoiceNumber: 'INV-001',
    date: '2023-11-21',
    customer: {
        name: 'John Doe',
        address: '123 Main St, City, Country'
    },
    items: [
        { name: 'Product A', quantity: 2, rate: 100 },
        { name: 'Service B', quantity: 1, rate: 500 }
    ],
    totals: {
        subtotal: 700,
        totalTax: 126,
        total: 826
    }
};

export default function TemplatesPage() {
    const router = useRouter();
    const { templateId, setTemplateId, lendingBillTemplateId, setLendingBillTemplateId, loadSettings } = useSettingsStore();
    const [selectedId, setSelectedId] = useState('modern');
    const [selectedLendingId, setSelectedLendingId] = useState('modern');

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (templateId) {
            setSelectedId(templateId);
        }
        if (lendingBillTemplateId) {
            setSelectedLendingId(lendingBillTemplateId);
        }
    }, [templateId, lendingBillTemplateId]);

    const handleSave = async () => {
        await setTemplateId(selectedId);
        await setLendingBillTemplateId(selectedLendingId);
        router.back();
    };

    const selectedTemplate = templates[selectedId] || templates.modern;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid #e5e7eb',
                position: 'sticky', top: 0, zIndex: 10
            }}>
                <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                <div style={{ fontWeight: 700, fontSize: 18 }}>Invoice Templates</div>
            </div>

            {/* Preview Area */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', justifyContent: 'center', background: '#f3f4f6' }}>
                <div style={{
                    width: '100%', maxWidth: '400px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '8px', overflow: 'hidden'
                }}>
                    <img
                        src={selectedTemplate.previewImage}
                        alt="Template Preview"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </div>
            </div>

            {/* Template Selector */}
            {/* Invoice Template Selector */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '16px', fontWeight: 600 }}>Choose Invoice Template</div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                    {Object.values(templates).map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedId(template.id)}
                            style={{
                                minWidth: '100px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '100px',
                                border: selectedId === template.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {selectedId === template.id && (
                                    <div style={{
                                        position: 'absolute', top: 4, right: 4,
                                        background: '#2563eb', borderRadius: '50%',
                                        width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FiCheck size={10} color="white" />
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: selectedId === template.id ? 600 : 400 }}>
                                {template.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lending Bill Template Selector */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600 }}>Lending Bill Template</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>This template controls the layout and styling of your Lending Bill PDFs.</div>
                </div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {Object.values(templates).map((template) => (
                        <div
                            key={`lending-${template.id}`}
                            onClick={() => setSelectedLendingId(template.id)}
                            style={{
                                minWidth: '100px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '100px',
                                border: selectedLendingId === template.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {selectedLendingId === template.id && (
                                    <div style={{
                                        position: 'absolute', top: 4, right: 4,
                                        background: '#2563eb', borderRadius: '50%',
                                        width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FiCheck size={10} color="white" />
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: selectedLendingId === template.id ? 600 : 400 }}>
                                {template.name}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        width: '100%',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        marginTop: '16px'
                    }}
                >
                    Save & Update
                </button>
            </div>
        </div>
    );
}
