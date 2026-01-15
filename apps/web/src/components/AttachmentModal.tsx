import React from 'react';

interface AttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: 'image' | 'pdf'; // Simplified type check from URL or passed explicitly
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({ isOpen, onClose, fileUrl, fileType }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative z-20 w-full max-w-4xl h-[90vh] flex flex-col bg-[#111122] rounded-xl border border-[#333366] shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333366] bg-[#151525]">
                    <h3 className="text-white text-lg font-bold">Lampiran Transaksi</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#9292c8] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#242447]"
                            title="Buka di tab baru"
                        >
                            <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                        <button onClick={onClose} className="text-[#9292c8] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#242447]">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#0a0a16] flex items-center justify-center overflow-auto p-4">
                    {fileType === 'pdf' ? (
                        <iframe
                            src={fileUrl}
                            className="w-full h-full rounded-lg bg-white"
                            title="Attachment PDF"
                        ></iframe>
                    ) : (
                        <img
                            src={fileUrl}
                            alt="Attachment"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
