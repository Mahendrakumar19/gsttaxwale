"use client";
import React from 'react';

export default function WhatsAppWidget() {
  return (
    <a
      href="https://wa.me/919321908755?text=Hi%20GST%20Tax%20Wale%2C%20I%20need%20help%20with%20tax%20filing"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-green-600/50 transition transform hover:scale-110"
      title="Chat with us on WhatsApp"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.718.738 5.33 2.134 7.51L2.885 22l7.9-2.078a9.857 9.857 0 004.746 1.227h.005c5.432 0 9.856-4.422 9.856-9.846 0-2.621-.567-5.083-1.588-7.432C19.54 5.502 15.889 2.979 11.826 2.979z" />
      </svg>
    </a>
  );
}
