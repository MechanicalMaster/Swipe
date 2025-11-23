import React, { useRef } from 'react';
import { FiCamera } from 'react-icons/fi';

export const ImagePicker = ({ image, onImageSelect }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageSelect(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            onClick={() => fileInputRef.current.click()}
            style={{
                width: '100px',
                height: '100px',
                borderRadius: '16px',
                background: image ? `url(${image}) center/cover no-repeat` : '#f3f4f6',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            {!image && <FiCamera size={32} color="#9ca3af" />}

            {/* Edit Icon Overlay */}
            <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'white',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '16px' }}>+</div>
            </div>
        </div>
    );
};
