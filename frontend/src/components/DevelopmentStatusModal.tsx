import React, { useEffect } from 'react';
import { Close as CloseIcon } from '@mui/icons-material';

interface Feature {
    title: string;
    description: string;
    status: 'In Progress' | 'Planned' | 'Coming Soon';
}

interface DevelopmentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DevelopmentStatusModal: React.FC<DevelopmentStatusModalProps> = ({ isOpen, onClose }) => {
    const features: Feature[] = [
        {
            title: 'Customer Management',
            description: 'Add, edit, and manage customer information with a comprehensive contact database.',
            status: 'In Progress'
        },
        {
            title: 'Invoice Analytics',
            description: 'View detailed reports and charts on invoice performance, revenue trends, and payment patterns.',
            status: 'In Progress'
        },
        {
            title: 'Payment Tracking',
            description: 'Track payment status in real-time and send automated payment reminders to customers.',
            status: 'Planned'
        },
        {
            title: 'Multi-currency Support',
            description: 'Create and manage invoices in different currencies with automatic exchange rate conversion.',
            status: 'Planned'
        },
        {
            title: 'Invoice Templates',
            description: 'Customize invoice designs with professional templates and branding options.',
            status: 'Coming Soon'
        },
        {
            title: 'Recurring Invoices',
            description: 'Set up automatic recurring invoices for subscription-based services and regular clients.',
            status: 'Coming Soon'
        },
        {
            title: 'Export Features',
            description: 'Export invoices and reports to various formats including Excel, CSV, and PDF.',
            status: 'Coming Soon'
        },
        {
            title: 'Email Integration',
            description: 'Send invoices directly to customers via email with customizable templates and tracking.',
            status: 'Planned'
        }
    ];

    const getStatusColor = (status: Feature['status']): string => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border border-blue-300';
            case 'Planned':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
            case 'Coming Soon':
                return 'bg-purple-100 text-purple-800 border border-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">What's New</h2>
                        <p className="text-blue-100 text-sm md:text-base mt-1">Features currently under development</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-white"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                                        {feature.title}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getStatusColor(
                                            feature.status
                                        )}`}
                                    >
                                        {feature.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">💡 Stay tuned!</span> We're constantly working on new features to improve your invoice management experience. Check back regularly for updates.
                        </p>
                    </div>
                </div>

                {/* Close Button at Bottom */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DevelopmentStatusModal;
