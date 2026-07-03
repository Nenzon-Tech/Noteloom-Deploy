import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Download, Loader2, Maximize, Minimize, 
  Printer, ExternalLink, Search, X, ArrowUp, ArrowDown 
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PdfAiSummarizer from '@/components/features/ai/PdfAiSummarizer'; // Update path as needed

// 1. SILENCE BENIGN WARNINGS
// const originalWarn = console.warn;
// console.warn = (...args) => {
//   if (args[0] && typeof args[0] === 'string' && args[0].includes('AbortException')) return;
//   originalWarn(...args);
// };

// Worker Configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// 2. TEXT RENDERER (Pure Function)
const highlightTextRenderer = (textItem, searchText) => {
  if (!searchText) return textItem.str;

  // Robust regex escaping
  const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedText})`, 'gi');
  const parts = textItem.str.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchText.toLowerCase()) {
      return (
        <span
          key={index}
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.4)', // Semi-transparent Gold
            height: '100%',
            cursor: 'text',
            borderRadius: '2px',
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// 3. MEMOIZED DOCUMENT AREA
const PDFDocumentArea = React.memo(({ fileUrl, pageNumber, scale, onDocumentLoadSuccess, onPageTextLoadSuccess, highlightText }) => {
  
  // Create a stable renderer function that closes over 'highlightText'
  const customRenderer = useCallback(
    (textItem) => highlightTextRenderer(textItem, highlightText),
    [highlightText]
  );

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={
         <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
           <p className="text-sm opacity-50 font-medium">Loading Document...</p>
         </div>
      }
      className="shadow-2xl"
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={false}
        onRenderTextLayerSuccess={onPageTextLoadSuccess}
        customTextRenderer={customRenderer}
        className="shadow-2xl rounded-lg overflow-hidden bg-white"
      />
    </Document>
  );
}, (prevProps, nextProps) => {
  // CRITICAL: We MUST re-render if 'highlightText' changes
  return (
    prevProps.fileUrl === nextProps.fileUrl &&
    prevProps.pageNumber === nextProps.pageNumber &&
    prevProps.scale === nextProps.scale &&
    prevProps.highlightText === nextProps.highlightText
  );
});

const ModernPDFViewer = ({ fileUrl, isDarkMode, isStandalone = false }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]); 
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);

  // --- 1. SEARCH ENGINE & DEBOUNCER ---
  useEffect(() => {
    // If search is cleared, update immediately
    if (!searchText.trim()) {
      setSearchResults([]);
      setDebouncedSearchText(''); // Clear highlights immediately
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Wait 500ms after typing stops before triggering the highlight/search
    const handler = setTimeout(async () => {
      
      // 1. Update the text used for highlighting
      setDebouncedSearchText(searchText); 

      // 2. Run the Search Logic (Find page numbers)
      if (pdfDocument) {
        const matches = [];
        const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedText, 'gi');

        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          
          const found = pageText.match(regex);
          if (found) {
            found.forEach(() => matches.push(i));
          }
        }

        setSearchResults(matches);
        setCurrentResultIndex(0);
        
        if (matches.length > 0 && !matches.includes(pageNumber)) {
          setPageNumber(matches[0]);
        }
      }
      
      setIsSearching(false);
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchText, pdfDocument]);

  // --- Navigation Helpers ---
  const nextMatch = () => {
    if (searchResults.length === 0) return;
    const newIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(newIndex);
    setPageNumber(searchResults[newIndex]);
  };

  const prevMatch = () => {
    if (searchResults.length === 0) return;
    const newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(newIndex);
    setPageNumber(searchResults[newIndex]);
  };

  const handlePageTextLoadSuccess = useCallback(() => {
     // No-op: Needed to satisfy prop requirements without forcing re-renders
  }, []);

  // --- 2. ROBUST PRINTING ---
  const handleDirectPrint = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 500);
      };

      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      }, 60000);

    } catch (error) {
      console.error("Print failed:", error);
      alert("Could not print. Try downloading instead.");
    }
  };

  // --- 3. DOWNLOAD & NEW TAB ---
  const handleDirectDownload = async () => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileUrl.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenNewTab = () => {
    const encodedUrl = encodeURIComponent(fileUrl);
    window.open(`/pdf-viewer?file=${encodedUrl}`, '_blank');
  };

  // --- UI Helpers ---
  const onDocumentLoadSuccess = (pdf) => {
    setPdfDocument(pdf);
    setNumPages(pdf.numPages);
  };

  // Styles
  const glassPanel = `backdrop-blur-xl border border-white/20 shadow-2xl ${
    isDarkMode ? 'bg-black/40 text-white' : 'bg-white/60 text-gray-800'
  }`;
  
  const glassButton = `p-2 rounded-lg transition-all duration-200 border border-transparent ${
    isDarkMode ? 'hover:bg-white/10 hover:border-white/10 active:bg-white/20' : 'hover:bg-black/5 hover:border-black/5 active:bg-black/10'
  }`;

  const containerClasses = isFullscreen 
    ? 'fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-200' 
    : `flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl transition-all relative group ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`;

  return (
    <div className={containerClasses}>
      
      {/* --- TOOLBAR --- */}
      <div className={`flex flex-wrap items-center justify-between p-3 z-10 transition-all ${glassPanel} border-b-0`}>
        
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-white/40'}`}>
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className={`${glassButton} disabled:opacity-30`}>
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <span className="text-sm font-bold min-w-[3rem] text-center font-mono">
              {pageNumber}/{numPages || '-'}
            </span>
            <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className={`${glassButton} disabled:opacity-30`}>
              <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* Finder */}
        {isSearchOpen ? (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/50 flex-1 max-w-md mx-4 animate-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-black/50' : 'bg-white/80'}`}>
             <Search className="w-4 h-4 text-blue-500"/>
             <input 
               autoFocus
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
               placeholder="Find in document..."
               className="bg-transparent border-none outline-none text-sm w-full"
             />
             <div className="flex items-center gap-1 border-l border-gray-500/30 pl-2">
               {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-blue-500"/> : (
                 <>
                   <span className="text-xs opacity-60 font-mono min-w-[30px]">
                     {searchResults.length > 0 ? `${currentResultIndex + 1}/${searchResults.length}` : '0'}
                   </span>
                   <button onClick={prevMatch} className="p-1 hover:text-blue-500"><ArrowUp className="w-4 h-4"/></button>
                   <button onClick={nextMatch} className="p-1 hover:text-blue-500"><ArrowDown className="w-4 h-4"/></button>
                   <button onClick={() => { setIsSearchOpen(false); setSearchText(''); }} className="p-1 hover:text-red-500"><X className="w-4 h-4"/></button>
                 </>
               )}
             </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* Tools */}
        <div className="flex items-center gap-2">
          <PdfAiSummarizer pdfUrl={fileUrl} isDarkMode={isDarkMode} />
          
          <div className={`hidden sm:flex items-center gap-1 rounded-lg p-1 mr-2 ${isDarkMode ? 'bg-black/20' : 'bg-white/40'}`}>
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className={glassButton}><ZoomOut className="w-4 h-4"/></button>
            <span className="text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2.5, s + 0.25))} className={glassButton}><ZoomIn className="w-4 h-4"/></button>
          </div>

          {!isSearchOpen && (
            <button onClick={() => setIsSearchOpen(true)} className={glassButton} title="Find">
              <Search className="w-5 h-5"/>
            </button>
          )}

          <div className="h-6 w-px bg-white/20 mx-1"></div>

          <button onClick={handleDirectPrint} className={glassButton} title="Print">
            <Printer className="w-5 h-5"/>
          </button>

          {!isStandalone && (
            <button onClick={handleOpenNewTab} className={glassButton} title="Open in New Tab">
              <ExternalLink className="w-5 h-5"/>
            </button>
          )}

          <button onClick={handleDirectDownload} className={glassButton} title="Download">
            <Download className="w-5 h-5"/>
          </button>
          
          <button 
             onClick={() => { setIsFullscreen(!isFullscreen); setScale(isFullscreen ? 1.0 : 1.25); }} 
             className={`${glassButton} ${isFullscreen ? 'bg-blue-600/80 text-white hover:bg-blue-600' : ''}`}
          >
            {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* --- VIEWER CANVAS --- */}
      <div className={`flex-1 overflow-auto flex justify-center p-8 relative scrollbar-thin scrollbar-thumb-gray-500/20 ${
        isFullscreen ? 'bg-black/90' : (isDarkMode ? 'bg-[#0f1115]' : 'bg-gray-200/50')
      }`}>
        <PDFDocumentArea 
          fileUrl={fileUrl}
          pageNumber={pageNumber}
          scale={scale}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onPageTextLoadSuccess={handlePageTextLoadSuccess}
          highlightText={debouncedSearchText}
        />
      </div>
    </div>
  );
};

export default ModernPDFViewer;