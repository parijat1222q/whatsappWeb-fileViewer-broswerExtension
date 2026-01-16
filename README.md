# WhatsApp Web File Viewer (Chrome Extension)

A privacy-focused Chrome Extension that enhances WhatsApp Web by allowing you to view **PDF, CSV, Excel, JSON, Code, and Image** files directly within the interface, without downloading them to your computer.

##  Features

- **In-Page Viewing**: Opens files in a modal overlay on top of WhatsApp Web.
- **Privacy First**: Files are processed entirely in-memory. **No data is stored** on your disk or sent to external servers.
- **Supported Formats**:
  - **PDF**: Uses native browser PDF viewing.
  - **CSV**: Interactive table with sorting, filtering, and column toggles.
  - **Excel (.xlsx, .xls)**: Automatically converts to CSV for viewing (powered by SheetJS).
  - **JSON**: Pretty-prints JSON files using your browser's native viewer.
  - **Code**: Syntax highlighting for common formats (`.py`, `.js`, `.html`, etc.).
  - **Images**: Zoomable image viewer.
- **Advanced Data Tools** (CSV):
  - **Quick Stats**: Shows Sum/Average for numeric columns.
  - **Charts**: Generate simple bar charts from your data.
  - **Export View**: Save filtered/sorted data as a new CSV.

##  Installation (Developer Mode)

1.  **Clone/Download** this repository to your local machine.
2.  Open **Chrome** and go to `chrome://extensions/`.
3.  Enable **Developer mode** (top right toggle).
4.  Click **Load unpacked**.
5.  Select the directory containing `manifest.json`.
6.  Go to [WhatsApp Web](https://web.whatsapp.com) and click any supported file!

##  Project Structure

```
├── manifest.json       # Extension configuration (Manifest V3)
├── fileViewer.js       # Core logic: Intercepts clicks & routes to handlers
├── lib/
│   ├── xlsx.full.min.js # SheetJS library for Excel parsing
│   └── shim.js          # Compatibility fix for WhatsApp module system
├── utils/
    ├── modal.js        # UI Component: The overlay window
    ├── csvTools.js     # Logic: CSV parsing, table rendering, stats
    ├── excelTools.js   # Logic: Excel -> CSV conversion
    ├── chartTools.js   # Logic: Chart generation
    ├── textTools.js    # Logic: Code & JSON viewing
    └── imageTools.js   # Logic: Image viewing with zoom

```

##  Technical Details

- **Manifest V3**: Compliant with modern Chrome extension standards.
- **Lazy Initialization**: The `Modal` is only created when you click a file, keeping the extension lightweight.
- **Shim Injection**: Uses a special `shim.js` to ensure the Excel library works correctly within WhatsApp Web's specific Javascript environment.

##  License

This project is open-source. Feel free to modify and use it for personal or educational purposes.

---
*Note: This extension is not affiliated with WhatsApp Inc.*
