'use client';

import Image from 'next/image';

interface Props {
  isAdminPanel?: boolean;
}

export default function WhatsAppWidget({ isAdminPanel = false }: Props) {
  return (
    <a
      href="https://wa.me/917368040555?text=Hi%20GST%20Tax%20Wale%2C%20I%20need%20help%20with%20tax%20filing"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-40 flex items-center justify-center text-white transition transform shadow-lg hover:shadow-green-600/50 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:scale-110 ${
        isAdminPanel 
          ? 'w-10 h-10 right-6 top-[calc(50%-2rem)] rounded-lg p-2' 
          : 'w-12 h-12 right-6 top-[calc(50%-2rem)] rounded-full'
      }`}
      title="Chat with us on WhatsApp"
    >
      <Image
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        alt="WhatsApp Icon"
        width={isAdminPanel ? 20 : 24}
        height={isAdminPanel ? 20 : 24}
        className="w-full h-full"
      />
    </a>
  );
}
