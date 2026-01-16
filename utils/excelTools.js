class ExcelTools {
    static async convertToCsv(blob) {
        return new Promise((resolve, reject) => {
            if (typeof XLSX === 'undefined' || typeof XLSX.read !== 'function') {
                return reject(new Error('SheetJS library not loaded correctly (XLSX.read missing). Reload or check connection.'));
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                try {
                    const workbook = XLSX.read(data, { type: 'array' });
                    if (!workbook.SheetNames.length) {
                        throw new Error('Excel file appears improper or empty.');
                    }
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const csv = XLSX.utils.sheet_to_csv(worksheet);
                    resolve(csv);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(blob);
        });
    }
}
