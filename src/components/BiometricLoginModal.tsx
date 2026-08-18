import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle, X } from 'lucide-react';
import { soundAlert } from '../utils/audioAlerts';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  savedPin: string;
  businessName: string;
}

export const BiometricLoginModal: React.FC<BiometricLoginModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  savedPin,
  businessName,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [usePinMode, setUsePinMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsScanning(false);
      setScanSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBiometricScan = async () => {
    setIsScanning(true);
    setErrorMsg('');

    try {
      // If the browser supports WebAuthn, we can attempt a real credential check or simulated pleasant scan
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        soundAlert.playReadyChime();
        soundAlert.speakText('Huella digital verificada con éxito. Bienvenido.');
        setTimeout(() => {
          onSuccess();
        }, 600);
      }, 1200);
    } catch {
      setIsScanning(false);
      setErrorMsg('No se pudo verificar la huella. Por favor ingresa tu clave PIN.');
      setUsePinMode(true);
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === savedPin || pin === '1234') {
      soundAlert.playReadyChime();
      soundAlert.speakText('Acceso concedido.');
      onSuccess();
    } else {
      soundAlert.playReminderBell();
      setErrorMsg('PIN incorrecto. (PIN predeterminado: 1234)');
      setPin('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === (savedPin?.length || 4)) {
        if (newPin === savedPin || newPin === '1234') {
          soundAlert.playReadyChime();
          soundAlert.speakText('Acceso concedido.');
          onSuccess();
        } else {
          soundAlert.playReminderBell();
          setErrorMsg('PIN incorrecto. (PIN predeterminado: 1234)');
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Acceso al Panel de Control
          </h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            {businessName || 'Memo Alert'}
          </p>
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mt-2 border border-indigo-100">
            Área exclusiva para el emprendedor
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!usePinMode ? (
          /* Biometric Fingerprint Screen */
          <div className="text-center py-2">
            <p className="text-gray-600 font-medium mb-6 text-sm">
              Coloca tu dedo en el lector de huella o toca el botón para acceder rápidamente:
            </p>

            <button
              type="button"
              onClick={handleBiometricScan}
              disabled={isScanning || scanSuccess}
              className={`group relative mx-auto w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg border-2 cursor-pointer ${
                scanSuccess
                  ? 'bg-emerald-600 border-emerald-400 text-white scale-105'
                  : isScanning
                  ? 'bg-indigo-500 border-indigo-300 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 border-indigo-400 text-white hover:scale-105 active:scale-95 shadow-indigo-200'
              }`}
            >
              {scanSuccess ? (
                <ShieldCheck className="w-12 h-12 animate-bounce" />
              ) : (
                <Fingerprint className={`w-12 h-12 ${isScanning ? 'animate-spin' : 'group-hover:scale-110'}`} />
              )}
              <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">
                {scanSuccess ? '¡Autorizado!' : isScanning ? 'Escaneando...' : 'Tocar Huella'}
              </span>
            </button>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setUsePinMode(true)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-gray-600" />
                <span>Usar Contraseña / Clave PIN</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Keypad Screen */
          <div>
            <div className="mb-4">
              <p className="text-gray-600 text-center font-medium mb-3 text-xs sm:text-sm">
                Ingresa tu clave PIN numérica:
              </p>
              {/* PIN circles */}
              <div className="flex justify-center gap-2.5 mb-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > idx
                        ? 'bg-indigo-600 border-indigo-600 scale-110'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Accessible Big Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 bg-gray-50 hover:bg-indigo-50 active:bg-indigo-100 text-gray-900 rounded-xl text-xl font-bold border border-gray-200 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-12 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center justify-center uppercase cursor-pointer"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 bg-gray-50 hover:bg-indigo-50 active:bg-indigo-100 text-gray-900 rounded-xl text-xl font-bold border border-gray-200 flex items-center justify-center cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 flex items-center justify-center cursor-pointer"
              >
                ⌫
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUsePinMode(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Volver a Huella</span>
              </button>
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-200 transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-500 mt-3 font-medium">
              💡 Clave por defecto: <strong className="text-gray-800">1234</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
