
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  formUrl: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ formUrl }) => {
  // Generate QR code URL using qr-server.com API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success('Form URL copied to clipboard!');
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'form-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
        <img 
          src={qrCodeUrl} 
          alt="QR Code for form" 
          className="w-48 h-48"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Scan with your phone camera</p>
        <p className="text-xs text-gray-500 break-all max-w-xs">{formUrl}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-2" />
          Copy URL
        </Button>
        <Button variant="outline" size="sm" onClick={downloadQRCode}>
          <Download className="w-4 h-4 mr-2" />
          Download QR
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
