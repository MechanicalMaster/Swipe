'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { TAG_TEMPLATES, DEFAULT_TEMPLATE_ID } from '@/lib/data/tagTemplates';
import { api } from '@/api/backendClient';
import styles from './page.module.css';

export default function LabelTemplatesPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_ID);
    const [showBack, setShowBack] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load saved template preference
    useEffect(() => {
        const loadSavedTemplate = async () => {
            try {
                const settings = await api.settings.get();
                if (settings.selectedLabelTemplate) {
                    setSelectedTemplate(settings.selectedLabelTemplate);
                }
            } catch (err) {
                console.error('Failed to load template setting:', err);
            }
        };
        loadSavedTemplate();
    }, []);

    const handleSelectTemplate = async (templateId) => {
        setSelectedTemplate(templateId);
        setSaving(true);
        try {
            await api.settings.update('selectedLabelTemplate', templateId);
        } catch (err) {
            console.error('Failed to save template setting:', err);
        }
        setSaving(false);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                <h1 className={styles.title}>Label Templates</h1>
                <div style={{ width: 24 }}></div>
            </div>

            {/* Toggle Front/Back */}
            <div className={styles.toggleContainer}>
                <button
                    className={`${styles.toggleBtn} ${!showBack ? styles.active : ''}`}
                    onClick={() => setShowBack(false)}
                >
                    Front View
                </button>
                <button
                    className={`${styles.toggleBtn} ${showBack ? styles.active : ''}`}
                    onClick={() => setShowBack(true)}
                >
                    Back View
                </button>
            </div>

            {/* Template Grid */}
            <div className={styles.grid}>
                {TAG_TEMPLATES.map((template) => (
                    <div
                        key={template.template_id}
                        className={`${styles.card} ${selectedTemplate === template.template_id ? styles.selected : ''}`}
                        onClick={() => handleSelectTemplate(template.template_id)}
                    >
                        {selectedTemplate === template.template_id && (
                            <div className={styles.checkBadge}>
                                <FiCheck size={16} />
                            </div>
                        )}

                        <div className={styles.previewContainer}>
                            <img
                                key={`${template.template_id}-${showBack ? 'back' : 'front'}`}
                                src={showBack ? template.preview_back : template.preview_front}
                                alt={`${template.name} preview`}
                                className={styles.previewImage}
                                onError={(e) => {
                                    // Fallback to placeholder if image not found
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className={styles.previewPlaceholder} style={{ display: 'none' }}>
                                <div className={styles.barcodePlaceholder}></div>
                                <div className={styles.textPlaceholder}></div>
                                {template.template_id === 'WEIGHT' && (
                                    <div className={styles.weightBig}>9.97g</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <h3 className={styles.templateName}>{template.name}</h3>
                            <p className={styles.templateDesc}>{template.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon Note */}
            <div className={styles.note}>
                More templates coming soon
            </div>

            {saving && (
                <div className={styles.savingIndicator}>Saving...</div>
            )}
        </div>
    );
}
