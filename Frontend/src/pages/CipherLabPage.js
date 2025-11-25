import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, Unlock, Key, Grid3x3, Hash, Calculator, Copy, Check, Zap,
  Trophy, Sparkles, CheckCircle2, Sun, Moon, Flame, Upload, FileText, X, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import mammoth from 'mammoth';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//API Configuration
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

// POST JSON helper
async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

// PATCH stats to backend (Database Integration)
async function saveStatsToBackend(user, newStats) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn(" No auth token found, cannot save stats");
    return null;
  }

  console.log("📤 Sending stats to backend:", newStats);

  try {
    const res = await fetch(`${API_BASE}/api/users/me/stats`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stats: newStats }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error(" Backend returned error:", data);
      throw new Error(data.error || "Failed to save stats");
    }
    
    console.log("Backend saved stats:", data.stats);
    return data.stats;
  } catch (error) {
    console.error("Error saving stats to backend:", error);
    return null;
  }
}

const CipherLabPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get fresh stats from user context
  const stats = {
    points: 0,
    level: 1,
    combo: 0,
    bestCombo: 0,
    totalEncryptions: 0,
    totalDecryptions: 0,
    experiencedCiphers: [],
    ...(user?.stats || {}),
  };

  const [selectedCipher, setSelectedCipher] = useState(location.state?.cipher || null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentReward, setRecentReward] = useState(null);
  const [lastProcessed, setLastProcessed] = useState('');
  
  // File Upload States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'

  // Cipher States
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [affineCrackE, setAffineCrackE] = useState('E');
  const [affineCrackT, setAffineCrackT] = useState('T');
  const [showCrack, setShowCrack] = useState(false);

  const [monoKey, setMonoKey] = useState('QWERTYUIOPASDFGHJKLZXCVBNM');
  const [vigenereKey, setVigenereKey] = useState('KEY');

  const [playfairKey, setPlayfairKey] = useState('MONARCHY');
  const [playfairMatrix, setPlayfairMatrix] = useState([]);

  const [hillMatrix, setHillMatrix] = useState([[6, 24, 1], [13, 16, 10], [20, 17, 15]]);
  const [hillInverse, setHillInverse] = useState(null);
  const [hillSize, setHillSize] = useState(3);

  const [euclidA, setEuclidA] = useState(15);
  const [euclidM, setEuclidM] = useState(26);
  const [euclidResult, setEuclidResult] = useState('');

  // Hill Matrix Helpers
  const HILL_DEFAULT_2 = [[3, 3], [2, 5]];
  const HILL_DEFAULT_3 = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];

  const onHillSizeChange = (size) => {
    setHillSize(size);
    setHillMatrix(size === 2 ? HILL_DEFAULT_2 : HILL_DEFAULT_3);
    setHillInverse(null);
    setOutputText('');
  };

  const updateHillCell = (r, c, val) => {
    const m = hillMatrix.map(row => row.slice());
    const num = Number(val);
    m[r][c] = Number.isFinite(num) ? num : 0;
    setHillMatrix(m);
  };

  // Cipher Definitions
  const ciphers = [
    {
      id: 'affine',
      name: 'Affine Cipher',
      icon: Hash,
      description: 'Mathematical magic with C = aP + b (mod 26)',
      gradient: theme === 'dark'
        ? 'from-cyan-600 via-blue-700 to-blue-800'
        : 'from-cyan-400 via-blue-500 to-blue-600'
    },
    {
      id: 'mono',
      name: 'Mono-Alphabetic',
      icon: Key,
      description: 'Classic substitution with your custom alphabet',
      gradient: theme === 'dark'
        ? 'from-purple-600 via-purple-700 to-pink-800'
        : 'from-purple-400 via-purple-500 to-pink-600'
    },
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      icon: Lock,
      description: 'Polyalphabetic powerhouse with keyword magic',
      gradient: theme === 'dark'
        ? 'from-green-600 via-emerald-700 to-teal-800'
        : 'from-green-400 via-emerald-500 to-teal-600'
    },
    {
      id: 'playfair',
      name: 'Playfair Cipher',
      icon: Grid3x3,
      description: 'Digraph encryption with 5×5 matrix wizardry',
      gradient: theme === 'dark'
        ? 'from-orange-600 via-red-700 to-red-800'
        : 'from-orange-400 via-red-500 to-red-600'
    },
    {
      id: 'hill',
      name: 'Hill Cipher',
      icon: Grid3x3,
      description: 'Linear algebra meets cryptography',
      gradient: theme === 'dark'
        ? 'from-indigo-600 via-purple-700 to-purple-800'
        : 'from-indigo-400 via-purple-500 to-purple-600'
    },
    {
      id: 'euclid',
      name: 'Extended Euclid',
      icon: Calculator,
      description: 'Mathematical foundation for modular arithmetic',
      gradient: theme === 'dark'
        ? 'from-amber-600 via-orange-700 to-orange-800'
        : 'from-amber-400 via-orange-500 to-orange-600'
    },
  ];

  // Notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // File Upload Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Accept TXT, DOC, DOCX, and PDF files
    if (!['.txt', '.doc', '.docx', '.pdf'].includes(fileExtension)) {
      showNotification('⚠️ Please upload a TXT, Word document (.doc, .docx), or PDF file', 'error');
      return;
    }

    setFileName(file.name);
    setFileType(fileExtension);
    setIsProcessingFile(true);

    try {
      let extractedText = '';

      if (fileExtension === '.txt') {
        // Read text file directly
        extractedText = await file.text();
      } else if (fileExtension === '.doc' || fileExtension === '.docx') {
        // Extract text from Word document
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (fileExtension === '.pdf') {
        // Extract text from PDF
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          extractedText = fullText.trim();
          
          if (!extractedText) {
            showNotification('⚠️ No text found in PDF. The PDF might be image-based.', 'error');
            setIsProcessingFile(false);
            return;
          }
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          showNotification('❌ Error reading PDF: ' + pdfError.message, 'error');
          setIsProcessingFile(false);
          return;
        }
      }

      if (!extractedText.trim()) {
        showNotification('⚠️ File appears to be empty', 'error');
        setIsProcessingFile(false);
        return;
      }

      setInputText(extractedText);
      setUploadedFile(file);
      setInputMode('file');
      showNotification(`📄 File loaded: ${file.name} (${extractedText.length} characters)`, 'success');
    } catch (error) {
      console.error('Error reading file:', error);
      showNotification(`❌ Error reading file: ${error.message}`, 'error');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileName('');
    setFileType('');
    setInputText('');
    setOutputText('');
    setInputMode('text');
  };

  // Clear inputs for new operation while keeping mode selection
  const handleClearForNewInput = () => {
    if (inputMode === 'file') {
      setUploadedFile(null);
      setFileName('');
      setFileType('');
    }
    setInputText('');
    setOutputText('');
    setLastProcessed('');
  };

  // Download processed file with original format preserved
  const handleDownloadFile = async () => {
    if (!outputText || !fileName) return;

    const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
    const suffix = mode === 'encrypt' ? 'encrypted' : 'decrypted';

    try {
      if (fileType === '.txt') {
        // Simple text file
        const processedFileName = `${baseFileName}_${suffix}.txt`;
        const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, processedFileName);
      } 
      else if (fileType === '.docx' || fileType === '.doc') {
        // Create new DOCX with processed text
        const processedFileName = `${baseFileName}_${suffix}.docx`;
        const doc = new Document({
          sections: [{
            properties: {},
            children: outputText.split('\n').map(line => 
              new Paragraph({
                children: [new TextRun(line)]
              })
            )
          }]
        });
        
        const blob = await Packer.toBlob(doc);
        downloadBlob(blob, processedFileName);
      }
      else if (fileType === '.pdf') {
        // Create new PDF with processed text
        const processedFileName = `${baseFileName}_${suffix}.pdf`;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const lines = outputText.split('\n');
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        const margin = 50;
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const maxWidth = pageWidth - 2 * margin;
        
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;
        
        for (const line of lines) {
          // Word wrap if line is too long
          const words = line.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);
            
            if (textWidth > maxWidth && currentLine) {
              // Draw current line and start new one
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0)
              });
              yPosition -= lineHeight;
              currentLine = word;
              
              // Add new page if needed
              if (yPosition < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
              }
            } else {
              currentLine = testLine;
            }
          }
          
          // Draw remaining text
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            });
            yPosition -= lineHeight;
          }
          
          // Add new page if needed
          if (yPosition < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadBlob(blob, processedFileName);
      }
      
      showNotification(`✅ Downloaded: ${baseFileName}_${suffix}${fileType}`, 'success');
    } catch (error) {
      console.error('Error creating file:', error);
      showNotification('❌ Error creating download file', 'error');
    }
  };

  // Helper function to trigger download
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const copyToClipboard = async () => {
    if (outputText || euclidResult) {
      await navigator.clipboard.writeText(outputText || euclidResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Award Points with Database Integration
  //Accept baseStats parameter to avoid using stale user data
  const awardPoints = async (points, reason, baseStats = null) => {
    // Use provided baseStats or fallback to user stats
    const currentStats = baseStats || user?.stats || stats;

    const newPoints = (currentStats.points || 0) + points;
    const newLevel = Math.floor(newPoints / 500) + 1;
    const newCombo = (currentStats.combo || 0) + 1;

const newStats = {
  ...currentStats,
  points: newPoints,
  level: newLevel,
  combo: newCombo,
  bestCombo: Math.max(newCombo, currentStats.bestCombo || 0),
  totalEncryptions: currentStats.totalEncryptions || 0,
  totalDecryptions: currentStats.totalDecryptions || 0,
  experiencedCiphers: currentStats.experiencedCiphers || [],
};

    console.log('🏆 Awarding points:', {
      points,
      reason,
      newTotal: newPoints,
      newCombo,
      baseStats: baseStats ? 'provided' : 'from user'
    });

    // Save to backend database
    try {
      const savedStats = await saveStatsToBackend(user, newStats);
      if (savedStats) {
        updateUser({ ...user, stats: savedStats });
      }
    } catch (err) {
      console.error("Failed to save award stats:", err);
    }

    // Show reward popup
    setRecentReward({ points, reason });
    setTimeout(() => setRecentReward(null), 2000);

    // Level up notification
    if (newLevel > (currentStats.level || 1)) {
      showNotification(`🎉 LEVEL UP! You're now level ${newLevel}!`, 'levelup');
    }
  };

  // Increment Action Stats (Encrypt/Decrypt counter)
  //Return the updated stats so awardPoints can use them
  const incrementActionStats = async (cipherId) => {
    // Get fresh stats from user
    const currentStats = user?.stats || stats;

    // Create updated stats with incremented counters
    const newStats = {
      ...currentStats,
      totalEncryptions: mode === 'encrypt'
        ? (currentStats.totalEncryptions || 0) + 1
        : (currentStats.totalEncryptions || 0),
      totalDecryptions: mode === 'decrypt'
        ? (currentStats.totalDecryptions || 0) + 1
        : (currentStats.totalDecryptions || 0),
      experiencedCiphers: currentStats.experiencedCiphers?.includes(cipherId)
        ? currentStats.experiencedCiphers
        : [...(currentStats.experiencedCiphers || []), cipherId],
    };

    console.log('📊 Saving action stats:', {
      mode,
      totalEncryptions: newStats.totalEncryptions,
      totalDecryptions: newStats.totalDecryptions
    });

    // Save to backend database
    try {
      const savedStats = await saveStatsToBackend(user, newStats);
      if (savedStats) {
        updateUser({ ...user, stats: savedStats });
        return savedStats; //Return the saved stats
      }
    } catch (err) {
      console.error("Failed to save action stats:", err);
    }
    
    return newStats; //Return newStats as fallback
  };

  // Main Process Handler
  const handleProcess = async () => {
    if (!selectedCipher) return;

    // Validation: Require file upload or text input
    if (selectedCipher !== 'euclid') {
      if (!uploadedFile && !inputText.trim()) {
        showNotification('⚠️ Please upload a file or enter text to process!', 'error');
        return;
      }
    }

    // Duplicate Prevention
    const currentInput = `${selectedCipher}-${mode}-${inputText.trim().toUpperCase()}-${
      selectedCipher === 'affine' ? `${affineA}-${affineB}-${showCrack}` :
      selectedCipher === 'mono' ? monoKey :
      selectedCipher === 'vigenere' ? vigenereKey :
      selectedCipher === 'playfair' ? playfairKey :
      selectedCipher === 'hill' ? JSON.stringify(hillMatrix) : ''
    }`;

    if (currentInput === lastProcessed && selectedCipher !== 'euclid') {
      showNotification('⚠️ Enter different text to earn more points!', 'error');
      return;
    }

    try {
      let result = '';

      switch (selectedCipher) {
        case 'affine': {
          if (showCrack) {
            const r = await postJSON("/api/affine/crack", {
              text: inputText,
              plain1: affineCrackE,
              plain2: affineCrackT
            });

            if (r.preview) {
              setOutputText(r.preview);
              showNotification(`Cracked! a=${r.guessedA}, b=${r.guessedB}`, 'success');
            } else if (Array.isArray(r.candidates) && r.candidates[0]) {
              const top = r.candidates[0];
              setOutputText(top.preview);
              showNotification(`Cracked (top guess): a=${top.a}, b=${top.b}`, 'success');
            } else {
              setOutputText('');
              showNotification('No crack candidates returned.', 'error');
            }

            setLastProcessed(currentInput);
            await incrementActionStats('affine');
            const crackedStats = await saveStatsToBackend(user, {
              ...(user?.stats || stats),
              totalEncryptions: (user?.stats?.totalEncryptions || 0),
              totalDecryptions: (user?.stats?.totalDecryptions || 0),
            });
            // Award extra points for cracking with file upload
            const crackPoints = uploadedFile ? 65 : 50;
            await awardPoints(crackPoints, 'Code Cracked', crackedStats || user?.stats || stats);
            return;
          }

          const path = mode === 'encrypt' ? "/api/affine/encrypt" : "/api/affine/decrypt";
          const r = await postJSON(path, { text: inputText, a: affineA, b: affineB });
          result = r.result;
          break;
        }

        case 'mono': {
          if (monoKey.length !== 26) {
            showNotification('Key must be exactly 26 unique letters!', 'error');
            return;
          }
          const path = mode === 'encrypt' ? "/api/mono/encrypt" : "/api/mono/decrypt";
          const r = await postJSON(path, { text: inputText, key: monoKey });
          result = r.result;
          break;
        }

        case 'vigenere': {
          if (!vigenereKey) {
            showNotification('Please enter a keyword!', 'error');
            return;
          }
          const path = mode === 'encrypt' ? "/api/vigenere/encrypt" : "/api/vigenere/decrypt";
          const r = await postJSON(path, { text: inputText, key: vigenereKey });
          result = r.result;
          break;
        }

        case 'playfair': {
  const path =
    mode === 'encrypt'
      ? "/api/playfair/encrypt"
      : "/api/playfair/decrypt";

  const r = await postJSON(path, { text: inputText, key: playfairKey });

  if (mode === "encrypt") {
    setPlayfairMatrix(r.matrix || []);
  }

  result = r.result;
  break;
}


        case 'hill': {
          const path = mode === 'encrypt' ? "/api/hill/encrypt" : "/api/hill/decrypt";
          const r = await postJSON(path, { text: inputText, keyMat: hillMatrix });
          setHillInverse(r.inverse || null);
          result = r.result;
          break;
        }

        case 'euclid': {
          if (!Number.isFinite(euclidA) || !Number.isInteger(euclidA)) {
            showNotification('Enter a valid integer for a.', 'error');
            return;
          }
          if (!Number.isFinite(euclidM) || !Number.isInteger(euclidM) || euclidM === 0) {
            showNotification('Modulo (m) must be a non-zero integer.', 'error');
            return;
          }

          const r = await postJSON("/api/euclid", { a: euclidA, m: euclidM });
          const absM = Math.abs(euclidM);
          const normInv = r.inverse === null ? null : ((r.inverse % absM) + absM) % absM;

          setEuclidResult(
            `GCD(${euclidA}, ${euclidM}) = ${r.gcd}\n` +
            (r.gcd === 1
              ? `✓ Modular Inverse: ${euclidA}⁻¹ ≡ ${normInv} (mod ${euclidM})`
              : `✗ No modular inverse (GCD ≠ 1)`) +
            `\nBézout: ${euclidA}·${r.coefficients.x} + ${euclidM}·${r.coefficients.y} = ${r.gcd}`
          );

          // Handle Euclid stats separately (no encrypt/decrypt mode)
          const currentStats = user?.stats || stats;
          const euclidStats = {
            ...currentStats,
            experiencedCiphers: currentStats.experiencedCiphers?.includes('euclid')
              ? currentStats.experiencedCiphers
              : [...(currentStats.experiencedCiphers || []), 'euclid'],
          };

          try {
            const savedStats = await saveStatsToBackend(user, euclidStats);
            if (savedStats) {
              updateUser({ ...user, stats: savedStats });
              // Award points using the saved stats
              await awardPoints(10, 'Calculation', savedStats);
            }
          } catch (err) {
            console.error("Failed to save Euclid stats:", err);
          }
          
          return;
        }

        default:
          return;
      }

      setOutputText(result);
      setLastProcessed(currentInput);

      console.log("🎮 Processing complete, now updating stats...");

      //Wait for incrementActionStats and get the updated stats
      const updatedStats = await incrementActionStats(selectedCipher);

      // Award bonus points for file uploads (15 points instead of 10)
      const basePoints = uploadedFile ? 15 : 10;
      const comboBonus = (updatedStats.combo || 0) * 1.5;
      const pointReason = uploadedFile 
        ? `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} (File Bonus!)`
        : mode === 'encrypt' ? 'Encrypted' : 'Decrypted';

      console.log("💰 About to award points:", basePoints + comboBonus);

      //Pass the updated stats to awardPoints
      await awardPoints(
        basePoints + comboBonus,
        pointReason,
        updatedStats //Pass the fresh stats!
      );

      console.log(" All stats updates complete!");

      // Auto-download file if one was uploaded with format preservation
      if (uploadedFile && fileName) {
        const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
        const suffix = mode === 'encrypt' ? 'encrypted' : 'decrypted';

        try {
          if (fileType === '.txt') {
            const processedFileName = `${baseFileName}_${suffix}.txt`;
            const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
            downloadBlob(blob, processedFileName);
          } 
          else if (fileType === '.docx' || fileType === '.doc') {
            const processedFileName = `${baseFileName}_${suffix}.docx`;
            const doc = new Document({
              sections: [{
                properties: {},
                children: result.split('\n').map(line => 
                  new Paragraph({
                    children: [new TextRun(line)]
                  })
                )
              }]
            });
            
            const blob = await Packer.toBlob(doc);
            downloadBlob(blob, processedFileName);
          }
          else if (fileType === '.pdf') {
            const processedFileName = `${baseFileName}_${suffix}.pdf`;
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            const lines = result.split('\n');
            const fontSize = 12;
            const lineHeight = fontSize * 1.2;
            const margin = 50;
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const maxWidth = pageWidth - 2 * margin;
            
            let page = pdfDoc.addPage([pageWidth, pageHeight]);
            let yPosition = pageHeight - margin;
            
            for (const line of lines) {
              const words = line.split(' ');
              let currentLine = '';
              
              for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                
                if (textWidth > maxWidth && currentLine) {
                  page.drawText(currentLine, {
                    x: margin,
                    y: yPosition,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= lineHeight;
                  currentLine = word;
                  
                  if (yPosition < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    yPosition = pageHeight - margin;
                  }
                } else {
                  currentLine = testLine;
                }
              }
              
              if (currentLine) {
                page.drawText(currentLine, {
                  x: margin,
                  y: yPosition,
                  size: fontSize,
                  font: font,
                  color: rgb(0, 0, 0)
                });
                yPosition -= lineHeight;
              }
              
              if (yPosition < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
              }
            }
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            downloadBlob(blob, processedFileName);
          }
          
          showNotification(`✅ File downloaded: ${baseFileName}_${suffix}${fileType}`, 'success');
        } catch (error) {
          console.error('Error creating file:', error);
          showNotification('❌ Error creating download file', 'error');
        }
      }

    } catch (e) {
      console.error("Process error:", e);
      showNotification(e.message || 'Request failed', 'error');
    }
  };

  // Fetch Helper Matrices from Backend
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        if (selectedCipher === 'playfair' && playfairKey) {
          const r = await postJSON("/api/playfair/encrypt", { text: "", key: playfairKey });
          setPlayfairMatrix(r.matrix || []);
        }
        if (selectedCipher === 'hill') {
          setHillInverse(null);
          const r = await postJSON("/api/hill/encrypt", { text: "", keyMat: hillMatrix });
          setHillInverse(r.inverse || null);
        }
      } catch (err) {
        if (selectedCipher === 'hill') {
          setHillInverse(null);
          showNotification(err.message || 'Hill key not invertible (mod 26).', 'error');
        }
      }
    };

    fetchHelpers();
  }, [playfairKey, hillMatrix, hillSize, selectedCipher]);

  // Render Cipher Controls
  const renderCipherControls = () => {
    switch (selectedCipher) {
      case 'affine':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${currentTheme.text}`}>Configuration</h3>
              <button
                onClick={() => {
                  setShowCrack(prev => {
                    const next = !prev;
                    if (next) {
                      setInputText('');
                      setOutputText('');
                    }
                    return next;
                  });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showCrack
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {showCrack ? '🔓 Crack Mode' : '🔐 Normal Mode'}
              </button>
            </div>

            {showCrack ? (
              <div className="space-y-4">
                <div className={`${theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                    <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-700'} font-bold`}>Frequency Analysis Crack</span>
                  </div>
                  <p className={`${currentTheme.textMuted} text-sm mb-4`}>
                    Enter the two most frequent letters in the ciphertext (defaults: E and T)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Most Frequent</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackE}
                        onChange={(e) => setAffineCrackE(e.target.value.toUpperCase())}
                        className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-2 ${currentTheme.text} text-center text-2xl font-bold focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Second Most Frequent</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackT}
                        onChange={(e) => setAffineCrackT(e.target.value.toUpperCase())}
                        className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-2 ${currentTheme.text} text-center text-2xl font-bold focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Multiplier (a)</label>
                    <input
                      type="number"
                      value={affineA}
                      onChange={(e) => setAffineA(parseInt(e.target.value) || 1)}
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Shift (b)</label>
                    <input
                      type="number"
                      value={affineB}
                      onChange={(e) => setAffineB(parseInt(e.target.value) || 0)}
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                    />
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'} border-2 rounded-xl p-4`}>
                  <div className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} font-mono text-lg`}>
                    C = ({affineA} × P + {affineB}) mod 26
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'mono':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>
                Substitution Alphabet (26 unique letters)
              </label>
              <input
                type="text"
                value={monoKey}
                onChange={(e) => setMonoKey(e.target.value.toUpperCase().slice(0, 26))}
                maxLength={26}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-mono text-lg tracking-wider focus:outline-none`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm font-medium ${monoKey.length === 26 ? 'text-green-500' : 'text-amber-500'}`}>
                  {monoKey.length}/26 characters
                </span>
                {monoKey.length === 26 && (
                  <span className="flex items-center text-green-500 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Valid key!
                  </span>
                )}
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-xl p-4`}>
              <div className={`${currentTheme.textMuted} text-xs mb-2`}>ALPHABET</div>
              <div className={`${currentTheme.text} font-mono text-sm tracking-wider`}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
              <div className={`${currentTheme.textMuted} text-xs mt-2 mb-2`}>YOUR KEY</div>
              <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} font-mono text-sm tracking-wider`}>{monoKey || '...'}</div>
            </div>
          </div>
        );

      case 'vigenere':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Keyword</label>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg tracking-wide focus:outline-none`}
                placeholder="Enter your keyword..."
              />
            </div>
            <div className={`${theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Key className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} font-bold`}>Repeating Key</span>
              </div>
              <div className={`${currentTheme.textMuted} text-sm`}>
                Your keyword repeats throughout the message for polyalphabetic substitution
              </div>
            </div>
          </div>
        );

      case 'playfair':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Matrix Keyword</label>
              <input
                type="text"
                value={playfairKey}
                onChange={(e) => setPlayfairKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
              />
            </div>
            {playfairMatrix.length === 5 && (
              <div className={`${theme === 'dark' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'} border-2 rounded-xl p-6`}>
                <div className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'} font-bold mb-4 flex items-center`}>
                  <Grid3x3 className="w-5 h-5 mr-2" />
                  5×5 Playfair Matrix
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {playfairMatrix.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`${theme === 'dark' ? 'bg-orange-500/20 border-orange-500/40' : 'bg-orange-100 border-orange-300'} border-2 rounded-lg h-12 flex items-center justify-center ${currentTheme.text} font-bold text-lg hover:scale-110 transition-transform`}
                      >
                        {cell.toUpperCase()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'hill':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Matrix Size</label>
              <select
                value={hillSize}
                onChange={(e) => onHillSizeChange(parseInt(e.target.value))}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold focus:outline-none`}
              >
                <option value={2}>2×2 Matrix</option>
                <option value={3}>3×3 Matrix</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} border-2 rounded-xl p-4`}>
                <div className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'} font-bold mb-3 flex items-center`}>
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Key Matrix
                </div>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${hillSize}, minmax(0, 1fr))` }}
                >
                  {hillMatrix.map((row, r) =>
                    row.map((val, c) => (
                      <input
                        key={`${r}-${c}`}
                        type="number"
                        step="1"
                        value={val}
                        onChange={(e) => updateHillCell(r, c, e.target.value)}
                        className={`text-center ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-3 py-2 ${currentTheme.text} font-mono`}
                      />
                    ))
                  )}
                </div>
                <div className={`${currentTheme.textMuted} text-xs mt-3`}>
                  You can enter any integers (negatives allowed). Values are taken mod 26.
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-xl p-4`}>
                <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} font-bold mb-3 flex items-center`}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Inverse
                </div>
                <pre className={`${currentTheme.text} font-mono text-sm leading-relaxed`}>
                  {Array.isArray(hillInverse)
                    ? hillInverse.map(row => `[ ${row.join('  ')} ]`).join('\n')
                    : 'Not invertible for mod 26'}
                </pre>
              </div>
            </div>

            <div className={`${currentTheme.textMuted} text-xs`}>
              If the key isn't invertible (det not coprime with 26), an error appears and inverse shows "Not invertible".
            </div>
          </div>
        );

      case 'euclid':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Integer (a)</label>
                <input
                  type="number"
                  step="1"
                  value={euclidA}
                  onChange={(e) => setEuclidA(Number(e.target.value))}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Modulo (m)</label>
                <input
                  type="number"
                  step="1"
                  value={euclidM}
                  onChange={(e) => setEuclidM(Number(e.target.value))}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
            </div>
            {euclidResult && (
              <div className={`${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border-2 rounded-xl p-4`}>
                <div className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold mb-3`}>Result</div>
                <pre className={`${currentTheme.text} font-mono text-sm whitespace-pre-wrap leading-relaxed`}>{euclidResult}</pre>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const cipher = ciphers.find(c => c.id === selectedCipher);

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors?.[0] || 'bg-cyan-500/20'} rounded-full ${currentTheme.glow || 'blur-3xl'} top-0 right-0 animate-pulse`}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedCipher) {
                  setSelectedCipher(null);
                  handleClearForNewInput();
                  setEuclidResult('');
                  setShowCrack(false);
                } else {
                  navigate('/');
                }
              }}
              className={`px-4 py-2 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              } rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← {selectedCipher ? 'Back to Ciphers' : 'Home'}
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              {stats.combo > 0 && (
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-orange-500/30 border-orange-500' : 'bg-orange-100 border-orange-300'} border rounded-full backdrop-blur-xl`}>
                  <Flame className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`${currentTheme.text} font-bold`}>{stats.combo}x Combo</span>
                </div>
              )}
              <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-green-500/20 border-green-500/40' : 'bg-green-100 border-green-300'} border rounded-full backdrop-blur-xl`}>
                <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`${currentTheme.text} font-bold`}>{stats.points}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {!selectedCipher ? (
          <div>
            <div className="text-center mb-12">
              <h2 className={`text-5xl font-black mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-900'}`}>
                CHOOSE YOUR CIPHER
              </h2>
              <p className={`${currentTheme.textMuted} text-lg`}>Select an encryption technique to master</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ciphers.map((cipher) => {
                const Icon = cipher.icon;
                const tried = stats.experiencedCiphers.includes(cipher.id);

                return (
                  <button
                    key={cipher.id}
                    onClick={() => {
                      setSelectedCipher(cipher.id);
                      // Clear file and inputs when switching ciphers
                      handleClearForNewInput();
                    }}
                    className={`group relative backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover || ''}`}
                  >
                    {tried && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-r ${cipher.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                    <div className="relative flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${cipher.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-xl font-bold ${currentTheme.text} mb-2`}>{cipher.name}</h3>
                      <p className={`${currentTheme.textMuted} text-sm`}>{cipher.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 shadow-lg`}>
              {/* Cipher Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${cipher.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {React.createElement(cipher.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black ${currentTheme.text}`}>{cipher.name}</h2>
                    <p className={currentTheme.textMuted}>{cipher.description}</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              {selectedCipher !== 'euclid' && !showCrack && (
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={() => {
                      setMode('encrypt');
                      setInputText('');
                      setOutputText('');
                      setLastProcessed('');
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg ${
                      mode === 'encrypt'
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === 'dark'
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Lock className="w-5 h-5 inline mr-2" />
                    Encrypt
                  </button>

                  <button
                    onClick={() => {
                      setMode('decrypt');
                      setInputText('');
                      setOutputText('');
                      setLastProcessed('');
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg ${
                      mode === 'decrypt'
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === 'dark'
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Unlock className="w-5 h-5 inline mr-2" />
                    Decrypt
                  </button>
                </div>
              )}

              {/* Cipher Controls */}
              <div className="mb-6">
                {renderCipherControls()}
              </div>

              {/* Input/Output */}
              {selectedCipher !== 'euclid' && (
                <div className="space-y-4">
                  {/* Input Mode Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setInputMode('text');
                          handleClearForNewInput();
                        }}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          inputMode === 'text'
                            ? `bg-gradient-to-r ${cipher.gradient} text-white`
                            : theme === 'dark'
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        📝 Text Input
                      </button>
                      <button
                        onClick={() => {
                          setInputMode('file');
                          setInputText('');
                          setOutputText('');
                        }}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          inputMode === 'file'
                            ? `bg-gradient-to-r ${cipher.gradient} text-white`
                            : theme === 'dark'
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        📁 File Upload
                      </button>
                    </div>
                    {(inputText || uploadedFile) && (
                      <button
                        onClick={handleClearForNewInput}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          theme === 'dark'
                            ? 'bg-red-700 hover:bg-red-600'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                      >
                        🗑️ Clear
                      </button>
                    )}
                  </div>

                  {/* File Upload Section - Only show in file mode */}
                  {inputMode === 'file' && (
                    <div className={`${currentTheme.card} border-2 ${currentTheme.cardBorder} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-cyan-500" />
                        <label className={`${currentTheme.text} font-bold`}>
                          File Upload
                        </label>
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-lg">
                          +15 Points
                        </span>
                      </div>
                    </div>
                    
                    {!uploadedFile ? (
                      <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed ${currentTheme.cardBorder} rounded-lg cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-all`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileText className={`w-8 h-8 mb-2 ${currentTheme.textMuted}`} />
                          <p className={`text-sm ${currentTheme.textMuted}`}>
                            <span className="font-bold">Click to upload</span> or drag and drop
                          </p>
                          <p className={`text-xs ${currentTheme.textMuted}`}>
                            TXT, DOC, DOCX, or PDF files
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".txt,.doc,.docx,.pdf"
                          onChange={handleFileUpload}
                        />
                      </label>
                    ) : (
                      <div className={`flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg`}>
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-cyan-500" />
                          <div>
                            <p className={`${currentTheme.text} font-bold text-sm`}>{fileName}</p>
                            <p className={`${currentTheme.textMuted} text-xs`}>{fileType.toUpperCase()} file</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className={`p-2 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} rounded-lg transition-all`}
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Text Input Mode */}
                  {inputMode === 'text' && (
                    <>
                      <div>
                        <label className={`block ${currentTheme.text} font-bold mb-2`}>Input Text</label>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className={`w-full h-32 ${currentTheme.input} border-2 ${currentTheme.cardBorder} ${currentTheme.inputFocus} rounded-xl px-4 py-3 ${currentTheme.text} placeholder-opacity-30 focus:outline-none resize-none`}
                          placeholder="Enter different text each time to earn points..."
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`block ${currentTheme.text} font-bold`}>Output Text</label>
                          {outputText && (
                            <div className="flex items-center space-x-2">
                              {uploadedFile && (
                                <button
                                  onClick={handleDownloadFile}
                                  className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-cyan-700 hover:bg-cyan-600' : 'bg-cyan-200 hover:bg-cyan-300'} rounded-lg ${currentTheme.text} transition-all`}
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="font-bold">Download</span>
                                </button>
                              )}
                              <button
                                onClick={copyToClipboard}
                                className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg ${currentTheme.text} transition-all`}
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span className="font-bold">Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <textarea
                          value={outputText}
                          readOnly
                          className={`w-full h-32 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border-2 ${currentTheme.cardBorder} rounded-xl px-4 py-3 ${currentTheme.text} font-bold focus:outline-none resize-none`}
                          placeholder="Result will appear here..."
                        />
                      </div>
                    </>
                  )}

                  {/* File Ready Message - Only show in file mode when file is uploaded */}
                  {inputMode === 'file' && uploadedFile && (
                    <div className={`${currentTheme.card} border-2 ${currentTheme.cardBorder} rounded-xl p-6 text-center`}>
                      <FileText className={`w-16 h-16 mx-auto mb-4 ${currentTheme.textMuted}`} />
                      <p className={`${currentTheme.text} font-bold text-lg mb-2`}>
                        File Ready to Process
                      </p>
                      <p className={`${currentTheme.textMuted} text-sm mb-1`}>
                        {fileName}
                      </p>
                      <p className={`${currentTheme.textMuted} text-xs`}>
                        Click the button below to {mode === 'encrypt' ? 'encrypt' : 'decrypt'} and download
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                className={`w-full mt-6 py-4 px-8 bg-gradient-to-r ${cipher.gradient} hover:shadow-2xl text-white font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-105`}
              >
                {selectedCipher === 'euclid'
                  ? '🧮 CALCULATE'
                  : showCrack
                    ? '🔓 CRACK THE CODE'
                    : mode === 'encrypt'
                      ? '🔒 ENCRYPT MESSAGE'
                      : '🔓 DECRYPT MESSAGE'
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-6 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl ${
            notification.type === 'levelup'
              ? theme === 'dark' ? 'bg-amber-500/90 border-amber-300' : 'bg-amber-100 border-amber-400'
              : notification.type === 'success'
                ? theme === 'dark' ? 'bg-green-500/90 border-green-300' : 'bg-green-100 border-green-400'
                : notification.type === 'error'
                  ? theme === 'dark' ? 'bg-red-500/90 border-red-300' : 'bg-red-100 border-red-400'
                  : theme === 'dark' ? 'bg-cyan-500/90 border-cyan-300' : 'bg-cyan-100 border-cyan-400'
          }`}>
            <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-lg`}>{notification.message}</div>
          </div>
        </div>
      )}

      {/* Reward Popup */}
      {recentReward && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300' : 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-500'} backdrop-blur-xl px-8 py-4 rounded-2xl border-4 shadow-2xl animate-bounce`}>
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-white" />
              <div>
                <div className="text-white font-black text-2xl">+{recentReward.points}</div>
                <div className="text-white/90 text-sm">{recentReward.reason}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CipherLabPage;